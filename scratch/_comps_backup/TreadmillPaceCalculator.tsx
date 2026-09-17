"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PaceInput {
  speed: number;
  unit: "mph" | "kph";
  distanceMiles: number;
}

interface PaceResult {
  pacePerMileSec: number;
  pacePerKmSec: number;
  mph: number;
  kph: number;
  workoutMinutes: number;
  chartData: { name: string; minPerMile: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtPace(sec: number): string {
  if (sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcPace(input: PaceInput): PaceResult {
  const mph = input.unit === "mph" ? input.speed : input.speed * 0.621371;
  const kph = input.unit === "kph" ? input.speed : input.speed * 1.609344;
  const pacePerMileSec = mph > 0 ? 3600 / mph : 0;
  const pacePerKmSec = kph > 0 ? 3600 / kph : 0;
  const workoutMinutes = mph > 0 && input.distanceMiles > 0 ? (input.distanceMiles / mph) * 60 : 0;

  const chartData = [5, 6, 7, 8, 9, 10].map((s) => ({
    name: `${s} mph`,
    minPerMile: Number((3600 / s / 60).toFixed(2)),
    fill: Math.abs(s - mph) < 0.05 ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Treadmill Speed", value: `${input.speed} ${input.unit}` },
    { label: "Speed (mph)", value: `${mph.toFixed(2)} mph` },
    { label: "Speed (kph)", value: `${kph.toFixed(2)} kph` },
    { label: "Pace per Mile", value: fmtPace(pacePerMileSec) },
    { label: "Pace per Kilometer", value: fmtPace(pacePerKmSec) },
    { label: "Workout Distance", value: `${input.distanceMiles} mi` },
    { label: "Workout Time", value: workoutMinutes > 0 ? `${Math.floor(workoutMinutes)}:${String(Math.round((workoutMinutes % 1) * 60)).padStart(2, "0")}` : "—" },
  ];

  const summaryStats = [
    { label: "Pace per Mile", value: fmtPace(pacePerMileSec) },
    { label: "Pace per Kilometer", value: fmtPace(pacePerKmSec) },
    { label: "Speed", value: `${mph.toFixed(2)} mph / ${kph.toFixed(2)} kph` },
    { label: "Workout Time (3 mi)", value: `≈ ${Math.floor((3 / mph) * 60)}:${String(Math.round(((3 / mph) * 60 % 1) * 60)).padStart(2, "0")}` },
    { label: "Steps/mi at 3 ft stride", value: `${Math.round(5280 / 3)}` },
    { label: "Distance Set", value: `${input.distanceMiles} mi` },
  ];

  return { pacePerMileSec, pacePerKmSec, mph, kph, workoutMinutes, chartData, breakdown, summaryStats };
}

const DEFAULTS: PaceInput = { speed: 6, unit: "mph", distanceMiles: 3 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TreadmillPaceCalculator() {
  const [speed, setSpeed] = useState(String(DEFAULTS.speed));
  const [unit, setUnit] = useState<PaceInput["unit"]>(DEFAULTS.unit);
  const [distance, setDistance] = useState(String(DEFAULTS.distanceMiles));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<PaceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcPace({ speed: parse(speed, DEFAULTS.speed), unit, distanceMiles: parse(distance, DEFAULTS.distanceMiles) }));
  const reset = () => {
    setSpeed(String(DEFAULTS.speed));
    setUnit(DEFAULTS.unit);
    setDistance(String(DEFAULTS.distanceMiles));
    setResult(calcPace(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPace(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I convert treadmill speed to pace?", answer: "Pace per mile = 60 ÷ speed in mph. A 6.0 mph treadmill setting is a 10:00/mile pace; 7.5 mph is 8:00/mile; 10 mph is 6:00/mile. For kilometers, pace per km = 60 ÷ speed in kph." },
    { question: "Is treadmill pace the same as outdoor pace?", answer: "Not exactly. With zero wind resistance and a moving belt, most runners run 1–2% slower outdoors for the same effort. Many treadmills also read fast. Setting a 1% incline on the treadmill closely mimics outdoor effort." },
    { question: "What speed should I start at?", answer: "Beginners often start at 3.5–5.0 mph (12:00–17:00/mile pace); recreational runners 5.5–6.5 mph (9:15–11:00/mile); fit runners 7.0–8.5 mph (7:00–8:30/mile). Run at an effort where you can hold a conversation." },
    { question: "Does incline change effective pace?", answer: "Yes — a 1% incline roughly matches outdoor flat running, and steeper grades increase effort substantially (about 2% effort increase per degree, depending on speed). Use the incline feature for more realistic training." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Treadmill Pace Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Treadmill Pace Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Treadmill Speed</label>
                <div className={inp}><input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} className={ci} />
                  <select value={unit} onChange={(e) => setUnit(e.target.value as PaceInput["unit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="mph">mph</option><option value="kph">kph</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="text-sm text-primary font-medium text-left self-start">
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Workout</label>
                  <label className="text-sm font-medium mb-1 block">Distance</label>
                  <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mi</span></div>
                </div>
              </div>
            )}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pace per Mile</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{fmtPace(result.pacePerMileSec)} <span className="text-xl font-bold text-muted-foreground">/mi</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.mph.toFixed(2)} mph · {result.kph.toFixed(2)} kph · {fmtPace(result.pacePerKmSec)} per km</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Pace / km", fmtPace(result.pacePerKmSec)], ["Speed (mph)", `${result.mph.toFixed(2)}`], ["Workout (3 mi)", result.summaryStats[3].value]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Speed & Pace Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Pace at Common Speeds</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} reversed />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)} min/mi`, ""]} />
                      <Bar dataKey="minPerMile" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Reading Treadmill Speed and Pace</h2>
            <p>Treadmills display speed, runners think in pace. The conversion is simple: pace per mile = 60 ÷ mph. At 6 mph you run 10:00 miles; every 0.5 mph faster shaves roughly 30–45 seconds per mile depending on your speed. This calculator converts both ways and between mph and kph.</p>
            <h2 className="text-2xl font-bold mb-3">Matching Outdoor Effort</h2>
            <p>Indoors you get no wind resistance and the belt pulls your legs back, so the same pace feels easier than outdoors. A 1% incline is the standard compensation, and steeper grades raise effort significantly. If you train at 0% incline, expect outdoor paces to run about 1–2% slower at the same effort.</p>
            <h2 className="text-2xl font-bold mb-3">Calibrating Your Treadmill</h2>
            <p>Many home treadmills read 0.5–1.0 mph fast. Verify your speed against a foot pod, GPS watch, or by timing a known distance at a measured setting. Training off a miscalibrated belt skews every pace target you set.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/treadmill-pace-calculator" />
          <PopularCalculators exclude="/calculator/treadmill-pace-calculator" />
        </div>
      </div>
    </>
  );
}
