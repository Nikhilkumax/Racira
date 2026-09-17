"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface HrInput {
  age: number;
  restingHr: number;
  goal: "zone2" | "zone3" | "zone4" | "zone5";
}

interface Zone {
  name: string;
  desc: string;
  low: number;
  high: number;
  color: string;
}

interface HrResult {
  mhr: number;
  hrr: number;
  zones: Zone[];
  goalZone: Zone;
  chartData: { name: string; low: number; high: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const ZONE_META: { key: string; name: string; desc: string; color: string }[] = [
  { key: "z1", name: "Zone 1: Warm Up", desc: "50–60% HRR · Brisk walking", color: "#3b82f6" },
  { key: "z2", name: "Zone 2: Fat Burn", desc: "60–70% HRR · Light jogging, cycling", color: "#10b981" },
  { key: "z3", name: "Zone 3: Aerobic", desc: "70–80% HRR · Tempo runs, cardio", color: "#eab308" },
  { key: "z4", name: "Zone 4: Anaerobic", desc: "80–90% HRR · Hard interval training", color: "#f97316" },
  { key: "z5", name: "Zone 5: Peak", desc: "90–100% HRR · Sprinting", color: "#ef4444" },
];

function calcHr(input: HrInput): HrResult {
  // Gellish max heart rate: 207 − 0.7 × age (more accurate than 220 − age)
  const mhr = Math.round(207 - 0.7 * input.age);
  const hrr = Math.max(0, mhr - input.restingHr);

  const zones: Zone[] = ZONE_META.map((z, i) => {
    const low = Math.round(input.restingHr + hrr * (0.5 + i * 0.1));
    const high = i === 4 ? mhr : Math.round(input.restingHr + hrr * (0.6 + i * 0.1));
    return { name: z.name, desc: z.desc, low, high, color: z.color };
  });

  const goalIndex = input.goal === "zone2" ? 1 : input.goal === "zone3" ? 2 : input.goal === "zone4" ? 3 : 4;
  const goalZone = zones[goalIndex];

  const chartData = zones.map((z) => ({ name: z.name.split(":")[1].trim().split(" ")[0], low: z.low, high: z.high }));

  const breakdown = [
    { label: "Age", value: `${input.age} years` },
    { label: "Resting Heart Rate", value: `${input.restingHr} bpm` },
    { label: "Max Heart Rate (Gellish)", value: `${mhr} bpm` },
    { label: "Heart Rate Reserve", value: `${hrr} bpm` },
    ...zones.map((z) => ({ label: z.name, value: `${z.low}–${z.high} bpm` })),
  ];

  const summaryStats = [
    { label: "Max Heart Rate", value: `${mhr} bpm` },
    { label: "Heart Rate Reserve", value: `${hrr} bpm` },
    { label: "Target Zone", value: `${goalZone.name.split(":")[1].trim()}` },
    { label: "Target Range", value: `${goalZone.low}–${goalZone.high} bpm` },
    { label: "Zone 2 (Fat Burn)", value: `${zones[1].low}–${zones[1].high} bpm` },
    { label: "Zone 4 (Anaerobic)", value: `${zones[3].low}–${zones[3].high} bpm` },
  ];

  return { mhr, hrr, zones, goalZone, chartData, breakdown, summaryStats };
}

const DEFAULTS: HrInput = { age: 30, restingHr: 60, goal: "zone3" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TargetHeartRateCalculator() {
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [restingHr, setRestingHr] = useState(String(DEFAULTS.restingHr));
  const [goal, setGoal] = useState<HrInput["goal"]>(DEFAULTS.goal);
  const [result, setResult] = useState<HrResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcHr({ age: parse(age, DEFAULTS.age), restingHr: parse(restingHr, DEFAULTS.restingHr), goal }));
  const reset = () => {
    setAge(String(DEFAULTS.age));
    setRestingHr(String(DEFAULTS.restingHr));
    setGoal(DEFAULTS.goal);
    setResult(calcHr(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcHr(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the Karvonen Formula?", answer: "The Karvonen formula determines target heart rate zones using Heart Rate Reserve (HRR = max HR − resting HR). Zone range = resting HR + (HRR × %). Unlike '220 − age', it accounts for your current fitness level via your resting heart rate." },
    { question: "What is the 'Fat Burning Zone'?", answer: "Zone 2 (roughly 60–70% of HRR) is called the fat-burning zone because a higher percentage of calories burned comes from fat. However, high-intensity work (Zone 4) burns more total calories overall." },
    { question: "How do I find my true resting heart rate?", answer: "Measure it first thing in the morning, before getting out of bed. Count your pulse for 60 seconds, or use a fitness tracker. The average adult resting heart rate is 60–100 bpm; well-trained athletes often sit at 40–60." },
    { question: "How accurate is the max heart rate formula?", answer: "The Gellish formula (207 − 0.7 × age) is more accurate than the classic 220 − age, but formulas are still estimates. Your true max HR is genetic and only definitively measured through a maximal stress test." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Target Heart Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Target Heart Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Resting Heart Rate</label>
                <div className={inp}><input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">bpm</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Training Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value as HrInput["goal"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="zone2">Fat Burn (Zone 2)</option>
                <option value="zone3">Aerobic / Cardio (Zone 3)</option>
                <option value="zone4">Anaerobic / Interval (Zone 4)</option>
                <option value="zone5">Peak / VO2 Max (Zone 5)</option>
              </select>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Target Zone · {result.goalZone.name.split(":")[1].trim()}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.goalZone.low}–{result.goalZone.high} <span className="text-xl font-bold text-muted-foreground">bpm</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.goalZone.desc}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Max Heart Rate", `${result.mhr} bpm`], ["Heart Rate Reserve", `${result.hrr} bpm`], ["Target Range", `${result.goalZone.low}–${result.goalZone.high}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Heart Rate Zones (Karvonen)</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 + result.zones.indexOf(result.goalZone) ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Zone Ranges</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} bpm`, ""]} />
                      <Legend />
                      <Bar dataKey="low" name="Zone Low" fill="#94a3b8" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="high" name="Zone High" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">Why Train in Zones?</h2>
            <p>Heart rate zone training ensures you work out at the right intensity for your goals. Running a faster 5K requires time in Zones 3 and 4; building endurance for a marathon or burning fat efficiently means spending most of your time in Zone 2.</p>
            <h2 className="text-2xl font-bold mb-3">The 80/20 Rule of Endurance Training</h2>
            <p>Elite endurance athletes spend about 80% of training time in Zone 2 (easy, aerobic) and only 20% in Zones 4–5 (hard, anaerobic). Amateurs often make the mistake of running every session in Zone 3 — too fast to recover, too slow to build high-end speed.</p>
            <h2 className="text-2xl font-bold mb-3">Finding Your True Max Heart Rate</h2>
            <p>Formulas provide estimates. Your true maximum heart rate is genetic and can only be definitively measured through a maximal stress test. The Karvonen method's advantage is that resting heart rate personalizes your zones to your current fitness.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/target-heart-rate-calculator" />
          <PopularCalculators exclude="/calculator/target-heart-rate-calculator" />
        </div>
      </div>
    </>
  );
}
