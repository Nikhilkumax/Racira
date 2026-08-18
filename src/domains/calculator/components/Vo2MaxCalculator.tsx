"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface Vo2Input {
  method: "rockport" | "cooper" | "resting";
  weight: number;
  age: number;
  gender: "male" | "female";
  walkTime: number;
  endHr: number;
  distance: number;
  restingHr: number;
}

interface Vo2Result {
  vo2max: number;
  level: string;
  levelColor: string;
  mets: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fitnessLevel(vo2max: number): { level: string; color: string } {
  if (vo2max < 30) return { level: "Poor", color: "text-red-500" };
  if (vo2max < 40) return { level: "Fair", color: "text-amber-500" };
  if (vo2max < 50) return { level: "Good", color: "text-blue-500" };
  if (vo2max < 60) return { level: "Excellent", color: "text-emerald-600" };
  return { level: "Superior (Elite)", color: "text-purple-500" };
}

function calcVo2(input: Vo2Input): Vo2Result {
  let vo2max = 0;

  if (input.method === "cooper") {
    // Cooper 12-minute run: VO2max = (distance in meters − 504.9) / 44.73
    vo2max = (input.distance - 504.9) / 44.73;
  } else if (input.method === "rockport") {
    // Rockport 1-mile walk: 132.853 − 0.0769×lb − 0.3877×age + 6.315×gender(1=male) − 3.2649×min − 0.1565×HR
    const g = input.gender === "male" ? 1 : 0;
    vo2max = 132.853 - 0.0769 * input.weight - 0.3877 * input.age + 6.315 * g - 3.2649 * input.walkTime - 0.1565 * input.endHr;
  } else {
    // Uth-Sørensen-Overgaard-Pedersen: 15 × (HRmax / HRrest), HRmax = 208 − 0.7×age (Tanaka)
    const mhr = 208 - 0.7 * input.age;
    vo2max = 15 * (mhr / input.restingHr);
  }

  const { level, color } = fitnessLevel(vo2max);
  const mets = vo2max / 3.5; // 1 MET = 3.5 ml/kg/min

  const chartData = [
    { name: "You", value: Number(vo2max.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Poor", value: 30, fill: "#ef4444" },
    { name: "Fair", value: 40, fill: "#f59e0b" },
    { name: "Good", value: 50, fill: "#3b82f6" },
    { name: "Excellent", value: 60, fill: "#10b981" },
  ];

  const methodLabel = input.method === "rockport" ? "Rockport 1-Mile Walk Test" : input.method === "cooper" ? "Cooper 12-Minute Run Test" : "Resting Heart Rate Formula";

  const breakdown = [
    { label: "Estimation Method", value: methodLabel },
    ...(input.method === "cooper"
      ? [{ label: "Distance in 12 Minutes", value: `${input.distance.toFixed(0)} m` }]
      : input.method === "rockport"
        ? [
            { label: "Weight", value: `${input.weight.toFixed(0)} lb` },
            { label: "Age", value: `${input.age} years` },
            { label: "Gender", value: input.gender === "male" ? "Male" : "Female" },
            { label: "Walk Time", value: `${input.walkTime} minutes` },
            { label: "Ending Heart Rate", value: `${input.endHr} bpm` },
          ]
        : [
            { label: "Age", value: `${input.age} years` },
            { label: "Resting Heart Rate", value: `${input.restingHr} bpm` },
          ]),
    { label: "Estimated VO2 Max", value: `${vo2max.toFixed(1)} ml/kg/min` },
    { label: "METs (1 MET = 3.5)", value: `${mets.toFixed(1)}` },
    { label: "Fitness Level", value: level },
  ];

  const summaryStats = [
    { label: "Estimated VO2 Max", value: `${vo2max.toFixed(1)} ml/kg/min` },
    { label: "Fitness Level", value: level },
    { label: "METs", value: `${mets.toFixed(1)}` },
    { label: "Method", value: methodLabel },
    { label: "Oxygen Uptake (150 lb)", value: `${(vo2max * 68.04).toFixed(1)} ml/min` },
    { label: "VO2 Category", value: vo2max >= 50 ? "Top tier" : vo2max >= 40 ? "Above average" : "Needs improvement" },
  ];

  return { vo2max, level, levelColor: color, mets, chartData, breakdown, summaryStats };
}

const DEFAULTS: Vo2Input = { method: "rockport", weight: 160, age: 30, gender: "male", walkTime: 15, endHr: 120, distance: 2400, restingHr: 65 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function Vo2MaxCalculator() {
  const [method, setMethod] = useState<Vo2Input["method"]>(DEFAULTS.method);
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [gender, setGender] = useState<Vo2Input["gender"]>(DEFAULTS.gender);
  const [walkTime, setWalkTime] = useState(String(DEFAULTS.walkTime));
  const [endHr, setEndHr] = useState(String(DEFAULTS.endHr));
  const [distance, setDistance] = useState(String(DEFAULTS.distance));
  const [restingHr, setRestingHr] = useState(String(DEFAULTS.restingHr));
  const [result, setResult] = useState<Vo2Result | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcVo2({
      method,
      weight: parse(weight, DEFAULTS.weight),
      age: parse(age, DEFAULTS.age),
      gender,
      walkTime: parse(walkTime, DEFAULTS.walkTime),
      endHr: parse(endHr, DEFAULTS.endHr),
      distance: parse(distance, DEFAULTS.distance),
      restingHr: parse(restingHr, DEFAULTS.restingHr),
    }));
  const reset = () => {
    setMethod(DEFAULTS.method);
    setWeight(String(DEFAULTS.weight));
    setAge(String(DEFAULTS.age));
    setGender(DEFAULTS.gender);
    setWalkTime(String(DEFAULTS.walkTime));
    setEndHr(String(DEFAULTS.endHr));
    setDistance(String(DEFAULTS.distance));
    setRestingHr(String(DEFAULTS.restingHr));
    setResult(calcVo2(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcVo2(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is VO2 Max?", answer: "VO2 Max is the maximum amount of oxygen your body can utilize during intense exercise, measured in milliliters per minute per kilogram of body weight (ml/kg/min). It is the gold standard measure of cardiovascular fitness." },
    { question: "What is a good VO2 Max?", answer: "It varies by age and sex. For a 30-year-old male, 40–50 is good and above 55 is excellent; for a 30-year-old female, 35–45 is good and above 50 is excellent. Elite endurance athletes often score between 70 and 90." },
    { question: "Which test method is best?", answer: "The Cooper Test (running as far as possible in 12 minutes) is very accurate for runners. The Rockport Walk Test is safer and better for beginners or older adults. The Resting Heart Rate formula is the easiest but least accurate." },
    { question: "How do I improve my VO2 Max?", answer: "High-intensity interval training (HIIT) is the most effective stimulus. Consistent aerobic base work plus 1–2 interval sessions per week reliably raises VO2 Max within 8–12 weeks, especially in previously untrained individuals." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "VO2 Max Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">VO2 Max Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Estimation Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as Vo2Input["method"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="rockport">Rockport 1-Mile Walk Test</option>
                <option value="cooper">Cooper 12-Minute Run Test</option>
                <option value="resting">Resting Heart Rate Formula</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {method === "rockport" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Weight</label>
                    <div className={inp}><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Age</label>
                    <div className={inp}><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Walk Time</label>
                    <div className={inp}><input type="number" value={walkTime} onChange={(e) => setWalkTime(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ending Heart Rate</label>
                    <div className={inp}><input type="number" value={endHr} onChange={(e) => setEndHr(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">bpm</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value as Vo2Input["gender"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </>
              )}
              {method === "cooper" && (
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Distance Covered in 12 Minutes</label>
                  <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">m</span></div>
                </div>
              )}
              {method === "resting" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Age</label>
                    <div className={inp}><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Resting Heart Rate</label>
                    <div className={inp}><input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">bpm</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated VO2 Max</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.vo2max.toFixed(1)} <span className="text-xl font-bold text-muted-foreground">ml/kg/min</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Fitness level: <span className={`font-semibold ${result.levelColor}`}>{result.level}</span> · {result.mets.toFixed(1)} METs</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["VO2 Max", `${result.vo2max.toFixed(1)}`], ["METs", `${result.mets.toFixed(1)}`], ["Fitness Level", result.level]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Test Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.breakdown.length - 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Your Score vs Fitness Categories</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} ml/kg/min`, ""]} />
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
            <h2 className="text-2xl font-bold mb-3">Improving Your VO2 Max</h2>
            <p>While genetics play a significant role in your absolute potential, almost anyone can improve VO2 Max through consistent training. The most effective stimulus is high-intensity interval training (HIIT), combined with a solid aerobic base.</p>
            <h2 className="text-2xl font-bold mb-3">Why It Matters for Health</h2>
            <p>Beyond athletic performance, VO2 Max is one of the strongest independent predictors of longevity. Higher cardiovascular capacity means your heart works less hard during daily activities, lowering cardiovascular disease risk.</p>
            <h2 className="text-2xl font-bold mb-3">Clinical Testing vs. Estimation</h2>
            <p>The only way to measure true VO2 Max is in a sports science lab with metabolic equipment. However, the Cooper and Rockport formulas have been clinically validated to provide close estimates from simple field tests.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vo2-max-calculator" />
          <PopularCalculators exclude="/calculator/vo2-max-calculator" />
        </div>
      </div>
    </>
  );
}
