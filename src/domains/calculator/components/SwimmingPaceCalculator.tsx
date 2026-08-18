"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PaceInput {
  distance: number;
  unit: "m" | "yd";
  hours: number;
  minutes: number;
  seconds: number;
}

interface PaceResult {
  totalSeconds: number;
  pacePer100: number;
  paceLabel: string;
  speedMs: number;
  splits50: number;
  chartData: { name: string; secPer100: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtTime(totalSec: number): string {
  if (totalSec <= 0) return "—";
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcPace(input: PaceInput): PaceResult {
  const totalSeconds = input.hours * 3600 + input.minutes * 60 + input.seconds;
  const pacePer100 = input.distance > 0 ? (totalSeconds / input.distance) * 100 : 0;
  const speedMs = input.distance > 0 ? input.distance / totalSeconds : 0;
  const splits50 = pacePer100 / 2;

  const chartData = [
    { name: "Your Pace", secPer100: Number(pacePer100.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Elite", secPer100: 75, fill: "#10b981" },
    { name: "Advanced", secPer100: 90, fill: "#94a3b8" },
    { name: "Intermediate", secPer100: 120, fill: "#94a3b8" },
    { name: "Beginner", secPer100: 150, fill: "#94a3b8" },
  ];

  const breakdown = [
    { label: "Distance", value: `${input.distance} ${input.unit}` },
    { label: "Total Time", value: `${input.hours > 0 ? input.hours + ":" + String(input.minutes).padStart(2, "0") + ":" + String(input.seconds).padStart(2, "0") : input.minutes + ":" + String(input.seconds).padStart(2, "0")}` },
    { label: "Pace per 100", value: fmtTime(pacePer100) },
    { label: "50 m Split", value: fmtTime(splits50) },
    { label: "Speed", value: `${speedMs.toFixed(2)} m/s` },
  ];

  const summaryStats = [
    { label: "Pace per 100", value: fmtTime(pacePer100) },
    { label: "50 m Split", value: fmtTime(splits50) },
    { label: "Speed", value: `${speedMs.toFixed(2)} m/s` },
    { label: "Total Time", value: `${input.hours > 0 ? input.hours + ":" + String(input.minutes).padStart(2, "0") + ":" + String(input.seconds).padStart(2, "0") : input.minutes + ":" + String(input.seconds).padStart(2, "0")}` },
    { label: "Distance", value: `${input.distance} ${input.unit}` },
    { label: "100 m Time Estimate", value: fmtTime(pacePer100) },
  ];

  return { totalSeconds, pacePer100, paceLabel: fmtTime(pacePer100), speedMs, splits50, chartData, breakdown, summaryStats };
}

const DEFAULTS: PaceInput = { distance: 800, unit: "m", hours: 0, minutes: 16, seconds: 0 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SwimmingPaceCalculator() {
  const [distance, setDistance] = useState(String(DEFAULTS.distance));
  const [unit, setUnit] = useState<PaceInput["unit"]>(DEFAULTS.unit);
  const [hours, setHours] = useState(String(DEFAULTS.hours));
  const [minutes, setMinutes] = useState(String(DEFAULTS.minutes));
  const [seconds, setSeconds] = useState(String(DEFAULTS.seconds));
  const [result, setResult] = useState<PaceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcPace({ distance: parse(distance, DEFAULTS.distance), unit, hours: parse(hours, DEFAULTS.hours), minutes: parse(minutes, DEFAULTS.minutes), seconds: parse(seconds, DEFAULTS.seconds) }));
  const reset = () => {
    setDistance(String(DEFAULTS.distance));
    setUnit(DEFAULTS.unit);
    setHours(String(DEFAULTS.hours));
    setMinutes(String(DEFAULTS.minutes));
    setSeconds(String(DEFAULTS.seconds));
    setResult(calcPace(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPace(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is swimming pace?", answer: "Swimming pace is typically expressed as time per 100 meters or 100 yards — the swimming equivalent of running's minutes-per-mile. It is the standard way swimmers compare effort across different distances." },
    { question: "What is a good pace per 100?", answer: "Elite distance swimmers hold ~1:00–1:15 per 100 m; advanced club swimmers 1:20–1:35; intermediate 1:40–2:00; beginners 2:00–2:30. Times vary with stroke, age, and distance — treat these as rough guides." },
    { question: "How is pace different from speed?", answer: "Pace is time per unit distance; speed is distance per unit time. This calculator reports both (min:sec per 100 and m/s), because swimmers plan by pace while devices often display speed." },
    { question: "Should I pace evenly?", answer: "For events of 200 m and longer, even pacing is optimal — aim within ±1 second per 100. In sprint events (50–100 m), a slightly faster first half is normal and faster overall." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Swimming Pace Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Swimming Pace Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Distance</label>
                <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} />
                  <select value={unit} onChange={(e) => setUnit(e.target.value as PaceInput["unit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="m">m</option><option value="yd">yd</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Total Time</label>
              <div className="grid grid-cols-3 gap-2">
                <div className={inp}><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hr</span></div>
                <div className={inp}><input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
                <div className={inp}><input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sec</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pace per 100</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.paceLabel} <span className="text-xl font-bold text-muted-foreground">/100 {unit}</span></div>
                  <div className="text-sm text-muted-foreground mt-1">50 split {fmtTime(result.splits50)} · {result.speedMs.toFixed(2)} m/s</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["50 Split", fmtTime(result.splits50)], ["Speed", `${result.speedMs.toFixed(2)} m/s`], ["Total Time", result.breakdown[1].value]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Pace Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Your Pace vs Ability Levels</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} sec/100`, ""]} />
                      <Bar dataKey="secPer100" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Pace Is the Swimmer's Language</h2>
            <p>Whether you train in yards or meters, pace per 100 is how swimmers talk about effort: a 1:50 pace means 1 minute 50 seconds per 100 m. Converting a set or race time into pace per 100 — and its 50 m split — is the first step in planning a workout or race.</p>
            <h2 className="text-2xl font-bold mb-3">Using Pace in Training</h2>
            <p>Set your pace clock to your target per 100 and hold it. If you cannot hold the pace across the full distance, your target is too fast for current fitness. Even pacing — within a second per 100 — is the standard for events 200 m and up.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmark Expectations</h2>
            <p>Elite distance swimmers hold 1:00–1:15 per 100 m, advanced club swimmers 1:20–1:35, intermediate 1:40–2:00, and beginners 2:00–2:30. Compare like with like: short-course times run slightly faster than long-course at the same effort.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swimming-pace-calculator" />
          <PopularCalculators exclude="/calculator/swimming-pace-calculator" />
        </div>
      </div>
    </>
  );
}
