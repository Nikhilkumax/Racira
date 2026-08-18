"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface IdealBmiResult {
  heightCm: number;
  unit: string;
  minKg: number;
  maxKg: number;
  idealKg: number;
  overweightKg: number;
  obeseKg: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function calcIdealBmi(heightCm: number, unit: string): IdealBmiResult {
  const h = heightCm / 100;
  const minKg = 18.5 * h * h;
  const maxKg = 24.9 * h * h;
  const idealKg = 21.7 * h * h;
  const overweightKg = 25 * h * h;
  const obeseKg = 30 * h * h;

  const fmtW = (kg: number): string => {
    if (unit === "metric") return `${kg.toFixed(1)} kg`;
    return `${(kg * 2.20462).toFixed(1)} lb`;
  };
  const fmtH = (cm: number): string => {
    if (unit === "metric") return `${cm} cm`;
    const inches = cm / 2.54;
    return `${Math.floor(inches / 12)}′${Math.round(inches % 12)}″ (${cm} cm)`;
  };

  const breakdown = [
    { label: "Height", value: fmtH(heightCm) },
    { label: "Healthy Range (BMI 18.5–24.9)", value: `${fmtW(minKg)} – ${fmtW(maxKg)}` },
    { label: "Ideal Weight (BMI 21.7)", value: fmtW(idealKg) },
    { label: "Overweight Threshold (BMI 25)", value: fmtW(overweightKg) },
    { label: "Obese Threshold (BMI 30)", value: fmtW(obeseKg) },
    { label: "Underweight Below", value: fmtW(minKg) },
    { label: "Range Width", value: fmtW(maxKg - minKg) },
    { label: "Method", value: "WHO BMI classifications" },
  ];
  const summaryStats = [
    { label: "Ideal Weight", value: fmtW(idealKg) },
    { label: "Healthy Min", value: fmtW(minKg) },
    { label: "Healthy Max", value: fmtW(maxKg) },
    { label: "Overweight At", value: fmtW(overweightKg) },
    { label: "Obese At", value: fmtW(obeseKg) },
    { label: "Height", value: fmtH(heightCm) },
    { label: "BMI Ideal", value: "21.7" },
    { label: "Healthy Band", value: "18.5 – 24.9" },
  ];
  const chartData = [
    { name: "Under (18.5)", value: Math.round(minKg), fill: "#8b5cf6" },
    { name: "Min (18.5)", value: Math.round(minKg), fill: "#8b5cf6" },
    { name: "Ideal (21.7)", value: Math.round(idealKg), fill: "hsl(var(--primary))" },
    { name: "Max (24.9)", value: Math.round(maxKg), fill: "#10b981" },
    { name: "Over (25)", value: Math.round(overweightKg), fill: "#f59e0b" },
    { name: "Obese (30)", value: Math.round(obeseKg), fill: "#ef4444" },
  ];
  return { heightCm, unit, minKg, maxKg, idealKg, overweightKg, obeseKg, breakdown, summaryStats, chartData };
}

const DEFAULTS = { feet: "5", inches: "10", unit: "imperial" };

export default function IdealBmiWeightCalculator() {
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<IdealBmiResult | null>(null);

  const ft = parseInt(feet) || 0;
  const inch = parseInt(inches) || 0;
  const heightCm = Math.round((ft * 12 + inch) * 2.54);
  const errs: string[] = [];
  if (ft < 3 || ft > 8) errs.push("Height (feet) must be between 3 and 8.");
  if (inch < 0 || inch > 11) errs.push("Height (inches) must be between 0 and 11.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcIdealBmi(heightCm, unit)); };
  const reset = () => {
    setFeet(DEFAULTS.feet); setInches(DEFAULTS.inches); setUnit(DEFAULTS.unit);
    setResult(calcIdealBmi(178, "imperial"));
  };
  useEffect(() => { setResult(calcIdealBmi(178, "imperial")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What BMI range is healthy?", answer: "The WHO classifies 18.5–24.9 kg/m² as normal weight. This calculator derives the weight range at your height from those BMI boundaries." },
    { question: "What is the ideal BMI?", answer: "Mortality data suggests the lowest risk clusters near BMI 21–22; 21.7 is used here as the midpoint target weight." },
    { question: "Why might my ideal weight differ?", answer: "BMI ignores muscle mass and frame size — a muscular athlete can exceed 25 with low body fat. Treat the range as a general guideline, not a verdict." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Ideal BMI Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ideal BMI Weight Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className={lbl}>Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
              </div>
              <div>
                <label className={lbl}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={sel}>
                  <option value="imperial">Pounds (lb)</option>
                  <option value="metric">Kilograms (kg)</option>
                </select>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Healthy Weight Range</div>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">{(result.unit === "metric" ? result.minKg : result.minKg * 2.20462).toFixed(1)} – {(result.unit === "metric" ? result.maxKg : result.maxKg * 2.20462).toFixed(1)} {result.unit === "metric" ? "kg" : "lb"}</div>
                <div className="text-sm text-muted-foreground mt-1">Ideal: {(result.unit === "metric" ? result.idealKg : result.idealKg * 2.20462).toFixed(1)} {result.unit === "metric" ? "kg" : "lb"} at BMI 21.7</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Ideal Weight`, `${(result.unit === "metric" ? result.idealKg : result.idealKg * 2.20462).toFixed(1)} ${result.unit === "metric" ? "kg" : "lb"}`], ["Overweight At", `${(result.unit === "metric" ? result.overweightKg : result.overweightKg * 2.20462).toFixed(1)} ${result.unit === "metric" ? "kg" : "lb"}`], ["Obese At", `${(result.unit === "metric" ? result.obeseKg : result.obeseKg * 2.20462).toFixed(1)} ${result.unit === "metric" ? "kg" : "lb"}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Weight Thresholds</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Weights at Each BMI</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}kg`} />
                    <Tooltip formatter={(v: number) => [`${v} kg`, ""]} />
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Deriving Weight from BMI</h2>
            <p>This <strong>ideal BMI weight calculator</strong> inverts the BMI formula — weight = BMI × height² — to find the weight that lands you at each classification boundary. For a given height, healthy weight spans the BMI band 18.5 to 24.9, with 21.7 marking the low-risk midpoint.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Thresholds</h2>
            <p>The overweight line (BMI 25) and obese line (BMI 30) mark where epidemiological risk rises in population data. The range between them and the healthy band is where most adults should aim — and where your clinician will expect to see you.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations</h2>
            <p>BMI is a screening tool, not a body-composition measure. Muscular builds, pregnancy, and some ethnicities shift the interpretation; use this for general planning and discuss specifics with a healthcare provider.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ideal-bmi-weight-calculator" />
          <PopularCalculators exclude="/calculator/ideal-bmi-weight-calculator" />
        </div>
      </div>
    </>
  );
}
