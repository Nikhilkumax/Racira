"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BmiInput {
  unitSystem: "imperial" | "metric";
  heightFt: number;
  heightIn: number;
  heightCm: number;
  weightLbs: number;
  weightKg: number;
}

interface BmiResult {
  bmi: number;
  category: string;
  description: string;
  colorClass: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSeniorBmi(input: BmiInput): BmiResult {
  let heightMeters = 0;
  let currentWeight = 0;
  let weightLabel = "";
  let heightLabel = "";

  if (input.unitSystem === "imperial") {
    const totalInches = input.heightFt * 12 + input.heightIn;
    heightMeters = totalInches * 0.0254;
    currentWeight = input.weightLbs * 0.453592;
    weightLabel = `${input.weightLbs} lb`;
    heightLabel = `${input.heightFt}'${input.heightIn}"`;
  } else {
    heightMeters = input.heightCm / 100;
    currentWeight = input.weightKg;
    weightLabel = `${input.weightKg} kg`;
    heightLabel = `${input.heightCm} cm`;
  }

  const bmi = currentWeight / Math.pow(heightMeters, 2);

  let category: string;
  let description: string;
  let colorClass: string;

  // Geriatric BMI classification (65+): optimal 23–27.9
  if (bmi < 23) {
    category = "Underweight";
    description = "Below the recommended senior range. In older adults, a BMI under 23 is associated with higher risk of osteoporosis, frailty, and increased mortality.";
    colorClass = "text-amber-500";
  } else if (bmi <= 27.9) {
    category = "Healthy Weight";
    description = "In the optimal range for seniors (23–27.9). This provides a protective buffer supporting bone density, immune function, and longevity.";
    colorClass = "text-emerald-600";
  } else if (bmi <= 29.9) {
    category = "Overweight";
    description = "Slightly above the optimal senior range. Mild overweight in seniors is less risky than in younger adults but should be monitored to prevent progression.";
    colorClass = "text-orange-500";
  } else {
    category = "Obese";
    description = "In the obese range (30+). This significantly raises the risk of osteoarthritis, cardiovascular disease, and metabolic disorders.";
    colorClass = "text-red-500";
  }

  const chartData = [
    { name: "Under 23", value: 23, fill: "#f59e0b" },
    { name: "Healthy 23–27.9", value: 27.9, fill: "#10b981" },
    { name: "Over 28–29.9", value: 29.9, fill: "#f97316" },
    { name: "Obese 30+", value: 30, fill: "#ef4444" },
    { name: "Your BMI", value: Number(bmi.toFixed(1)), fill: "hsl(var(--primary))" },
  ];

  const breakdown = [
    { label: "Unit System", value: input.unitSystem === "imperial" ? "Imperial (lb, ft/in)" : "Metric (kg, cm)" },
    { label: "Height", value: heightLabel },
    { label: "Weight", value: weightLabel },
    { label: "Body Mass Index", value: bmi.toFixed(1) },
    { label: "Geriatric Category (65+)", value: category },
    { label: "Optimal Senior Range", value: "23.0 – 27.9" },
    { label: "Standard Adult Range", value: "18.5 – 24.9 (not used)" },
    { label: "Assessment", value: description.split(".")[0] },
  ];

  const summaryStats = [
    { label: "Body Mass Index", value: bmi.toFixed(1) },
    { label: "Category (65+)", value: category },
    { label: "Optimal Senior Range", value: "23.0 – 27.9" },
    { label: "Weight", value: weightLabel },
    { label: "Height", value: heightLabel },
    { label: "Status", value: bmi < 23 ? "Below range" : bmi <= 27.9 ? "Within range" : bmi <= 29.9 ? "Slightly above" : "Well above" },
  ];

  return { bmi, category, description, colorClass, chartData, breakdown, summaryStats };
}

const DEFAULTS: BmiInput = { unitSystem: "imperial", heightFt: 5, heightIn: 7, heightCm: 170, weightLbs: 165, weightKg: 75 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SeniorBmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<BmiInput["unitSystem"]>(DEFAULTS.unitSystem);
  const [heightFt, setHeightFt] = useState(String(DEFAULTS.heightFt));
  const [heightIn, setHeightIn] = useState(String(DEFAULTS.heightIn));
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [weightLbs, setWeightLbs] = useState(String(DEFAULTS.weightLbs));
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [result, setResult] = useState<BmiResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSeniorBmi({
      unitSystem,
      heightFt: parse(heightFt, DEFAULTS.heightFt),
      heightIn: parse(heightIn, DEFAULTS.heightIn),
      heightCm: parse(heightCm, DEFAULTS.heightCm),
      weightLbs: parse(weightLbs, DEFAULTS.weightLbs),
      weightKg: parse(weightKg, DEFAULTS.weightKg),
    }));
  const reset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setHeightFt(String(DEFAULTS.heightFt));
    setHeightIn(String(DEFAULTS.heightIn));
    setHeightCm(String(DEFAULTS.heightCm));
    setWeightLbs(String(DEFAULTS.weightLbs));
    setWeightKg(String(DEFAULTS.weightKg));
    setResult(calcSeniorBmi(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSeniorBmi(DEFAULTS));
  }, []);

  const faqs = [
    { question: "Why is the healthy BMI range higher for seniors?", answer: "Geriatric research shows the standard adult range (18.5–24.9) does not apply well to people over 65. A slightly higher BMI (23–27.9) provides a protective buffer against malnutrition, preserves bone density (reducing fracture risk), and improves survival during illness or hospitalization." },
    { question: "Is a BMI of 25 'overweight' for a senior?", answer: "No. While 25 is the start of 'Overweight' on the adult scale, it sits centered in the healthy optimal range (23–27.9) for a senior. The goal shifts from extreme leanness to functional strength and resilience." },
    { question: "What are the dangers of being underweight as a senior?", answer: "In the elderly, being underweight (BMI below 23) is more dangerous than being slightly overweight. It strongly correlates with sarcopenia (muscle loss), osteoporosis, weakened immune function, and higher mortality." },
    { question: "Does BMI measure muscle mass?", answer: "No. BMI cannot distinguish fat from muscle, and seniors naturally lose muscle with age. Use BMI alongside grip strength and mobility assessments for a fuller picture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Senior BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Senior BMI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex bg-muted p-1 rounded-lg">
              <button onClick={() => setUnitSystem("imperial")} className={`flex-1 h-9 text-sm font-medium rounded-md transition-all ${unitSystem === "imperial" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Imperial</button>
              <button onClick={() => setUnitSystem("metric")} className={`flex-1 h-9 text-sm font-medium rounded-md transition-all ${unitSystem === "metric" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Metric</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {unitSystem === "imperial" ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Height (ft)</label>
                    <div className={inp}><input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className={ci} /></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Height (in)</label>
                    <div className={inp}><input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className={ci} /></div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Current Weight</label>
                    <div className={inp}><input type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Height</label>
                    <div className={inp}><input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Weight</label>
                    <div className={inp}><input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Senior-Adjusted BMI</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.colorClass}`}>{result.bmi.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Category: <span className={`font-semibold ${result.colorClass}`}>{result.category}</span> · Optimal senior range 23.0–27.9</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["BMI", result.bmi.toFixed(1)], ["Category", result.category], ["Range Status", result.summaryStats[5].value]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">BMI Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Geriatric BMI Scale</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 40]} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} BMI`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why the BMI Scale Shifts With Age</h2>
            <p>Standard adult BMI categories were validated on working-age populations. For adults over 65, a slightly higher BMI is protective: fat reserves cushion against illness-related weight loss, and higher body mass correlates with preserved bone density and muscle mass. This calculator applies the geriatric scale — optimal 23.0–27.9 — instead of the adult 18.5–24.9.</p>
            <h2 className="text-2xl font-bold mb-3">The Risks of Being Underweight</h2>
            <p>In seniors, a BMI below 23 is more dangerous than mild overweight. It is linked to sarcopenia, osteoporosis, immune dysfunction, and sharply higher mortality. Nutrition and resistance training matter more than chasing a low number.</p>
            <h2 className="text-2xl font-bold mb-3">BMI Limitations</h2>
            <p>BMI cannot distinguish fat from muscle and does not reflect fat distribution. Use it alongside waist circumference, grip strength, and mobility assessments for a complete picture of senior health.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/senior-bmi-calculator" />
          <PopularCalculators exclude="/calculator/senior-bmi-calculator" />
        </div>
      </div>
    </>
  );
}
