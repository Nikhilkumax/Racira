"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SplitInput {
  totalDistance: number;
  hours: number;
  minutes: number;
  seconds: number;
  intervalDistance: number;
}

interface SplitResult {
  totalSeconds: number;
  splitSeconds: number;
  splitLabel: string;
  pacePer100: number;
  numSplits: number;
  chartData: { name: string; seconds: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtTime(totalSec: number): string {
  if (totalSec <= 0) return "—";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcSplit(input: SplitInput): SplitResult {
  const totalSeconds = input.hours * 3600 + input.minutes * 60 + input.seconds;
  const numSplits = input.totalDistance > 0 && input.intervalDistance > 0 ? input.totalDistance / input.intervalDistance : 0;
  const splitSeconds = numSplits > 0 ? totalSeconds / numSplits : 0;
  const pacePer100 = input.totalDistance > 0 ? (totalSeconds / input.totalDistance) * 100 : 0;

  const chartData = Array.from({ length: Math.min(10, Math.max(1, Math.round(numSplits))) }, (_, i) => ({
    name: `Split ${i + 1}`,
    seconds: Number(splitSeconds.toFixed(0)),
    fill: "hsl(var(--primary))",
  }));

  const breakdown = [
    { label: "Race Distance", value: `${input.totalDistance} ${input.intervalDistance >= 100 ? "m" : "yd"}` },
    { label: "Total Time", value: fmtTime(totalSeconds) },
    { label: "Interval Distance", value: `${input.intervalDistance} ${input.intervalDistance >= 100 ? "m" : "yd"}` },
    { label: "Target Split", value: fmtTime(splitSeconds) },
    { label: "Number of Splits", value: `${numSplits.toFixed(1)}` },
    { label: "Pace per 100", value: fmtTime(pacePer100) },
  ];

  const summaryStats = [
    { label: "Target Split", value: fmtTime(splitSeconds) },
    { label: "Pace per 100", value: fmtTime(pacePer100) },
    { label: "Number of Splits", value: `${numSplits.toFixed(1)}` },
    { label: "Total Time", value: fmtTime(totalSeconds) },
    { label: "Interval Distance", value: `${input.intervalDistance} m` },
    { label: "Race Distance", value: `${input.totalDistance} m` },
  ];

  return { totalSeconds, splitSeconds, splitLabel: fmtTime(splitSeconds), pacePer100, numSplits, chartData, breakdown, summaryStats };
}

const DEFAULTS: SplitInput = { totalDistance: 400, hours: 0, minutes: 5, seconds: 20, intervalDistance: 50 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SwimmingSplitCalculator() {
  const [distance, setDistance] = useState(String(DEFAULTS.totalDistance));
  const [hours, setHours] = useState(String(DEFAULTS.hours));
  const [minutes, setMinutes] = useState(String(DEFAULTS.minutes));
  const [seconds, setSeconds] = useState(String(DEFAULTS.seconds));
  const [interval, setInterval] = useState(String(DEFAULTS.intervalDistance));
  const [result, setResult] = useState<SplitResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSplit({ totalDistance: parse(distance, DEFAULTS.totalDistance), hours: parse(hours, DEFAULTS.hours), minutes: parse(minutes, DEFAULTS.minutes), seconds: parse(seconds, DEFAULTS.seconds), intervalDistance: parse(interval, DEFAULTS.intervalDistance) }));
  const reset = () => {
    setDistance(String(DEFAULTS.totalDistance));
    setHours(String(DEFAULTS.hours));
    setMinutes(String(DEFAULTS.minutes));
    setSeconds(String(DEFAULTS.seconds));
    setInterval(String(DEFAULTS.intervalDistance));
    setResult(calcSplit(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSplit(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a split time?", answer: "A split is the time for a defined segment of a race — commonly 50 m or 100 m in swimming. Even splits (identical times per segment) are the standard pacing strategy for most events, minimizing the energy cost of dramatic speed changes." },
    { question: "How do I calculate my target split?", answer: "Divide your goal total time by the number of intervals: for a 5:20 400 m with 50 m splits, that is 320 seconds ÷ 8 = 40 seconds per 50. This calculator does that for every distance and interval combination." },
    { question: "Should every split be identical?", answer: "Not exactly. Races are often swum slightly negative (second half a touch faster than first) or positive in sprints. Even splits are a great baseline — aim within ±1–2 seconds per 100 m rather than exact equality." },
    { question: "How do I convert between yards and meters?", answer: "Multiply meters by 1.0936 for yards (400 m ≈ 437 yd), or yards by 0.9144 for meters. Pace per 100 works the same way in whichever unit you train in — just keep the units consistent." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Swimming Split Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Swimming Split Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Race Distance</label>
                <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">m</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Interval Distance</label>
                <div className={inp}><input type="number" value={interval} onChange={(e) => setInterval(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">m</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Goal Total Time</label>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Target Split ({interval} m)</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.splitLabel}</div>
                  <div className="text-sm text-muted-foreground mt-1">Pace {fmtTime(result.pacePer100)} per 100 · {result.numSplits.toFixed(1)} splits · total {fmtTime(result.totalSeconds)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Pace / 100", fmtTime(result.pacePer100)], ["Splits", `${result.numSplits.toFixed(1)}`], ["Total Time", fmtTime(result.totalSeconds)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Split Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Even-Split Plan</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} sec`, ""]} />
                      <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Why Even Splits Win Races</h2>
            <p>Energy expenditure in swimming rises steeply with speed, so the cost of a fast first 100 m is paid later in the race. Even pacing — every split within a second or two of the average — is the optimal strategy for most events from 200 m to 1500 m. This calculator converts your goal total into per-interval targets.</p>
            <h2 className="text-2xl font-bold mb-3">Building a Race Plan</h2>
            <p>Take your target split and adjust: swim the first 50 m at the same speed (resist the urge to sprint), hold the middle splits, and save 1–2% for a finishing kick. In a 400 m, that might mean a 39–40 second average with the last 50 in 37–38.</p>
            <h2 className="text-2xl font-bold mb-3">Training to the Split</h2>
            <p>Set your pace clock or watch to the target split in practice. If you cannot hold it for the whole distance, your goal time is too ambitious — train at the split until it becomes sustainable, then reassess.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swimming-split-calculator" />
          <PopularCalculators exclude="/calculator/swimming-split-calculator" />
        </div>
      </div>
    </>
  );
}
