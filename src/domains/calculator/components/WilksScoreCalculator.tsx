"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WilksInput {
  sex: "male" | "female";
  bodyWeight: number;
  unit: "lb" | "kg";
  squat: number;
  bench: number;
  deadlift: number;
}

interface WilksResult {
  total: number;
  coefficient: number;
  score: number;
  bodyWeightKg: number;
  chartData: { name: string; lift: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// Classic Wilks coefficient (2003 coefficients, standard for comparisons)
const WILKS_COEF = {
  male: { a: -216.0475144, b: 16.2606339, c: -0.002388645, d: -0.00113732, e: 7.01863e-6, f: -1.291e-8 },
  female: { a: 594.31747775582, b: -27.23842536447, c: 0.82112226871, d: -0.00930733913, e: 4.731582e-5, f: -9.054e-8 },
} as const;

function wilksCoefficient(x: number, sex: "male" | "female"): number {
  const c = WILKS_COEF[sex];
  return 500 / (c.a + c.b * x + c.c * Math.pow(x, 2) + c.d * Math.pow(x, 3) + c.e * Math.pow(x, 4) + c.f * Math.pow(x, 5));
}

function calcWilks(input: WilksInput): WilksResult {
  const bodyWeightKg = input.unit === "lb" ? input.bodyWeight / 2.20462 : input.bodyWeight;
  const total = input.squat + input.bench + input.deadlift;
  // Wilks uses the total in kilograms: score = total(kg) × coefficient
  const totalKg = input.unit === "lb" ? total / 2.20462 : total;
  const coefficient = wilksCoefficient(bodyWeightKg, input.sex);
  const score = totalKg * coefficient;

  const chartData = [
    { name: "Squat", lift: input.squat, fill: "hsl(var(--primary))" },
    { name: "Bench", lift: input.bench, fill: "#3b82f6" },
    { name: "Deadlift", lift: input.deadlift, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Sex", value: input.sex === "male" ? "Male" : "Female" },
    { label: "Body Weight", value: `${input.bodyWeight} ${input.unit}` },
    { label: "Squat", value: `${input.squat} ${input.unit}` },
    { label: "Bench Press", value: `${input.bench} ${input.unit}` },
    { label: "Deadlift", value: `${input.deadlift} ${input.unit}` },
    { label: "Total", value: `${total.toLocaleString()} ${input.unit}` },
    { label: "Wilks Coefficient", value: coefficient.toFixed(4) },
    { label: "Wilks Score", value: score.toFixed(2) },
  ];

  const summaryStats = [
    { label: "Wilks Score", value: score.toFixed(2) },
    { label: "Total Lifted", value: `${total.toLocaleString()} ${input.unit}` },
    { label: "Wilks Coefficient", value: coefficient.toFixed(4) },
    { label: "Body Weight", value: `${input.bodyWeight} ${input.unit}` },
    { label: "Squat", value: `${input.squat} ${input.unit}` },
    { label: "Bench / Deadlift", value: `${input.bench} / ${input.deadlift} ${input.unit}` },
  ];

  return { total, coefficient, score, bodyWeightKg, chartData, breakdown, summaryStats };
}

const DEFAULTS: WilksInput = { sex: "male", bodyWeight: 175, unit: "lb", squat: 315, bench: 225, deadlift: 405 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WilksScoreCalculator() {
  const [sex, setSex] = useState<WilksInput["sex"]>(DEFAULTS.sex);
  const [bodyWeight, setBodyWeight] = useState(String(DEFAULTS.bodyWeight));
  const [unit, setUnit] = useState<WilksInput["unit"]>(DEFAULTS.unit);
  const [squat, setSquat] = useState(String(DEFAULTS.squat));
  const [bench, setBench] = useState(String(DEFAULTS.bench));
  const [deadlift, setDeadlift] = useState(String(DEFAULTS.deadlift));
  const [result, setResult] = useState<WilksResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcWilks({
      sex,
      bodyWeight: parse(bodyWeight, DEFAULTS.bodyWeight),
      unit,
      squat: parse(squat, DEFAULTS.squat),
      bench: parse(bench, DEFAULTS.bench),
      deadlift: parse(deadlift, DEFAULTS.deadlift),
    }));
  const reset = () => {
    setSex(DEFAULTS.sex);
    setBodyWeight(String(DEFAULTS.bodyWeight));
    setUnit(DEFAULTS.unit);
    setSquat(String(DEFAULTS.squat));
    setBench(String(DEFAULTS.bench));
    setDeadlift(String(DEFAULTS.deadlift));
    setResult(calcWilks(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWilks(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a Wilks score?", answer: "The Wilks score normalizes a powerlifting total for body weight, allowing lifters of different sizes to be compared fairly. Wilks = total lifted × coefficient, where the coefficient is computed from the lifter's body weight and sex using a validated polynomial." },
    { question: "What is a good Wilks score?", answer: "Roughly: 300+ is a solid club-lifter baseline, 400+ is competitive at state level, 450+ approaches national elite, and 500+ is world-class. Benchmarks differ slightly by sex, with women's elite thresholds roughly 30–50 points lower." },
    { question: "How is the coefficient calculated?", answer: "For men: 500 ÷ (a + bx + cx² + dx³ + ex⁴ + fx⁵) with x = body weight in kg. Separate coefficient sets exist for men and women (this calculator uses the classic 2003 Wilks coefficients, still the standard for historical comparison)." },
    { question: "Why not just compare raw totals?", answer: "Raw totals favor heavier lifters who can move more absolute weight. The Wilks coefficient rewards efficiency relative to body weight, so a 150 lb lifter deadlifting 500 lb scores better than a 250 lb lifter doing the same." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Wilks Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Wilks Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex gap-2">
              <button onClick={() => setSex("male")} className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${sex === "male" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
              <button onClick={() => setSex("female")} className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${sex === "female" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Body Weight</label>
                <div className={inp}><input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} className={ci} />
                  <select value={unit} onChange={(e) => setUnit(e.target.value as WilksInput["unit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="lb">lb</option><option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Squat 1RM</label>
                <div className={inp}><input type="number" value={squat} onChange={(e) => setSquat(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bench Press 1RM</label>
                <div className={inp}><input type="number" value={bench} onChange={(e) => setBench(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deadlift 1RM</label>
                <div className={inp}><input type="number" value={deadlift} onChange={(e) => setDeadlift(e.target.value)} className={ci} /></div>
              </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Wilks Score</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.score.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total {result.total.toLocaleString()} {unit} at {result.bodyWeightKg.toFixed(1)} kg body weight · coefficient {result.coefficient.toFixed(4)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Total Lifted", `${result.total.toLocaleString()} ${unit}`], ["Coefficient", result.coefficient.toFixed(4)], ["Body Weight", `${result.bodyWeightKg.toFixed(1)} kg`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Lift Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 7 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Lift Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} ${unit}`, ""]} />
                      <Bar dataKey="lift" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Wilks Score?</h2>
            <p>The Wilks score is the standard formula for comparing powerlifting strength across body weights. It converts your squat + bench + deadlift total into a body-weight-normalized number: Wilks = total × coefficient(body weight, sex). Heavier lifters lift more absolute weight, so the coefficient compensates — a lighter lifter with the same total scores higher.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>The coefficient is 500 ÷ (a + bx + cx² + dx³ + ex⁴ + fx⁵), where x is body weight in kilograms and a–f are sex-specific constants from the classic 2003 Wilks coefficients. This calculator uses those original constants — the basis for most published strength standards and historical comparisons.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmark Ranges</h2>
            <p>As a rough guide: 300+ is a solid club-lifting baseline, 400+ is state-competitive, 450+ approaches national elite, and 500+ is world-class. Elite women's thresholds sit roughly 30–50 points lower. Newer formulas (e.g., IPF GL points) have largely replaced Wilks in federations, but Wilks remains the most widely understood comparison.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wilks-score-calculator" />
          <PopularCalculators exclude="/calculator/wilks-score-calculator" />
        </div>
      </div>
    </>
  );
}
