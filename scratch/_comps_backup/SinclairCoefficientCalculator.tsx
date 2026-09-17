"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SinclairInput {
  sex: "male" | "female";
  bodyWeight: number;
  unit: "lb" | "kg";
  snatch: number;
  cleanAndJerk: number;
}

interface SinclairResult {
  total: number;
  totalKg: number;
  coefficient: number;
  score: number;
  bodyWeightKg: number;
  chartData: { name: string; lift: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// IWF 2020 Sinclair coefficients
const SINCLAIR = {
  male: { a: 0.784780654, b: 174.393 },
  female: { a: 0.794358141, b: 148.026 },
} as const;

function sinclairCoefficient(x: number, sex: "male" | "female"): number {
  const { a, b } = SINCLAIR[sex];
  if (x >= b) return 1;
  return Math.pow(10, a * Math.pow(Math.log10(x / b), 2));
}

function calcSinclair(input: SinclairInput): SinclairResult {
  const bodyWeightKg = input.unit === "lb" ? input.bodyWeight / 2.20462 : input.bodyWeight;
  const total = input.snatch + input.cleanAndJerk;
  const totalKg = input.unit === "lb" ? total / 2.20462 : total;
  const coefficient = sinclairCoefficient(bodyWeightKg, input.sex);
  const score = totalKg * coefficient;

  const chartData = [
    { name: "Snatch", lift: input.snatch, fill: "hsl(var(--primary))" },
    { name: "Clean & Jerk", lift: input.cleanAndJerk, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Sex", value: input.sex === "male" ? "Male" : "Female" },
    { label: "Body Weight", value: `${input.bodyWeight} ${input.unit}` },
    { label: "Snatch", value: `${input.snatch} ${input.unit}` },
    { label: "Clean & Jerk", value: `${input.cleanAndJerk} ${input.unit}` },
    { label: "Total", value: `${total.toLocaleString()} ${input.unit}` },
    { label: "Sinclair Coefficient", value: coefficient.toFixed(4) },
    { label: "Sinclair Total", value: score.toFixed(2) },
  ];

  const summaryStats = [
    { label: "Sinclair Total", value: score.toFixed(2) },
    { label: "Lifted Total", value: `${total.toLocaleString()} ${input.unit}` },
    { label: "Sinclair Coefficient", value: coefficient.toFixed(4) },
    { label: "Body Weight", value: `${input.bodyWeight} ${input.unit}` },
    { label: "Snatch", value: `${input.snatch} ${input.unit}` },
    { label: "Clean & Jerk", value: `${input.cleanAndJerk} ${input.unit}` },
  ];

  return { total, totalKg, coefficient, score, bodyWeightKg, chartData, breakdown, summaryStats };
}

const DEFAULTS: SinclairInput = { sex: "male", bodyWeight: 175, unit: "lb", snatch: 225, cleanAndJerk: 275 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SinclairCoefficientCalculator() {
  const [sex, setSex] = useState<SinclairInput["sex"]>(DEFAULTS.sex);
  const [bodyWeight, setBodyWeight] = useState(String(DEFAULTS.bodyWeight));
  const [unit, setUnit] = useState<SinclairInput["unit"]>(DEFAULTS.unit);
  const [snatch, setSnatch] = useState(String(DEFAULTS.snatch));
  const [cleanAndJerk, setCleanAndJerk] = useState(String(DEFAULTS.cleanAndJerk));
  const [result, setResult] = useState<SinclairResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSinclair({
      sex,
      bodyWeight: parse(bodyWeight, DEFAULTS.bodyWeight),
      unit,
      snatch: parse(snatch, DEFAULTS.snatch),
      cleanAndJerk: parse(cleanAndJerk, DEFAULTS.cleanAndJerk),
    }));
  const reset = () => {
    setSex(DEFAULTS.sex);
    setBodyWeight(String(DEFAULTS.bodyWeight));
    setUnit(DEFAULTS.unit);
    setSnatch(String(DEFAULTS.snatch));
    setCleanAndJerk(String(DEFAULTS.cleanAndJerk));
    setResult(calcSinclair(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSinclair(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the Sinclair coefficient?", answer: "The Sinclair coefficient normalizes Olympic weightlifting totals for body weight, the way Wilks does for powerlifting. Lighter lifters receive a coefficient above 1.0; lifters at or above the standard body weight get exactly 1.0. Sinclair Total = total lifted × coefficient." },
    { question: "What are the current coefficients?", answer: "This calculator uses the IWF 2020 values: men a = 0.784780654, b = 174.393 kg; women a = 0.794358141, b = 148.026 kg. The formula is 10^(a × log₁₀(x/b)²) for body weight x below b, else 1.0." },
    { question: "How is it different from Wilks?", answer: "Wilks applies to powerlifting (squat, bench, deadlift) using a 500-point polynomial. Sinclair applies to weightlifting (snatch + clean & jerk) using a logarithmic formula tuned to IWF records. Both answer the same question: who lifted better relative to body weight?" },
    { question: "What is a good Sinclair total?", answer: "For men, roughly 250+ is a solid club-level total, 300+ is regional, 350+ is national-class, and 400+ approaches world-class. Women's benchmarks run roughly 50–70 points lower." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Sinclair Coefficient Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sinclair Coefficient Calculator</h1>

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
                  <select value={unit} onChange={(e) => setUnit(e.target.value as SinclairInput["unit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="lb">lb</option><option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Snatch 1RM</label>
                <div className={inp}><input type="number" value={snatch} onChange={(e) => setSnatch(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Clean & Jerk 1RM</label>
                <div className={inp}><input type="number" value={cleanAndJerk} onChange={(e) => setCleanAndJerk(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Sinclair Total</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.score.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total {result.total.toLocaleString()} {unit} at {result.bodyWeightKg.toFixed(1)} kg · coefficient {result.coefficient.toFixed(4)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Lifted Total", `${result.total.toLocaleString()} ${unit}`], ["Coefficient", result.coefficient.toFixed(4)], ["Body Weight", `${result.bodyWeightKg.toFixed(1)} kg`]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Sinclair Coefficient?</h2>
            <p>Olympic weightlifting compares lifters across body-weight classes using the Sinclair method. Your total (snatch + clean & jerk) is multiplied by a coefficient derived from your body weight: lighter lifters get a coefficient above 1.0, while lifters at or above the standard body weight (174.393 kg men, 148.026 kg women under the 2020 IWF values) get exactly 1.0.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>For body weight x (kg) below the standard b, the coefficient is 10^(a × log₁₀(x/b)²), with sex-specific a values. The logarithmic shape mirrors how lifting capacity scales with body size, making Sinclair totals comparable across all body-weight classes.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmark Ranges</h2>
            <p>For men: 250+ is a solid club baseline, 300+ regional, 350+ national-class, and 400+ world-class. Women's benchmarks run roughly 50–70 points lower. Treat these as rough guides — federations and eras differ.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sinclair-coefficient-calculator" />
          <PopularCalculators exclude="/calculator/sinclair-coefficient-calculator" />
        </div>
      </div>
    </>
  );
}
