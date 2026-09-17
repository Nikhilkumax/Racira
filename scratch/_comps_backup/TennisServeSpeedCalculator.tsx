"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ServeInput {
  distanceFt: number;
  flightTimeSec: number;
  dragFactor: number;
}

interface ServeResult {
  mph: number;
  kph: number;
  feetPerSec: number;
  chartData: { name: string; mph: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcServe(input: ServeInput): ServeResult {
  const feetPerSec = input.flightTimeSec > 0 ? (input.distanceFt / input.flightTimeSec) * input.dragFactor : 0;
  const mph = feetPerSec * 0.681818;
  const kph = mph * 1.609344;

  const chartData = [
    { name: "Your Serve", mph: Number(mph.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Recreational", mph: 80, fill: "#94a3b8" },
    { name: "Club Player", mph: 100, fill: "#94a3b8" },
    { name: "College / ATP", mph: 120, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Flight Distance", value: `${input.distanceFt} ft` },
    { label: "Flight Time", value: `${input.flightTimeSec.toFixed(2)} s` },
    { label: "Drag Adjustment", value: `×${input.dragFactor.toFixed(2)}` },
    { label: "Average Speed", value: `${mph.toFixed(1)} mph` },
    { label: "Speed (km/h)", value: `${kph.toFixed(1)} km/h` },
    { label: "Speed (ft/s)", value: `${feetPerSec.toFixed(1)} ft/s` },
  ];

  const summaryStats = [
    { label: "Estimated Serve Speed", value: `${mph.toFixed(1)} mph` },
    { label: "Speed (km/h)", value: `${kph.toFixed(1)} km/h` },
    { label: "Flight Distance", value: `${input.distanceFt} ft` },
    { label: "Flight Time", value: `${input.flightTimeSec.toFixed(2)} s` },
    { label: "Category", value: mph >= 120 ? "Pro-level" : mph >= 100 ? "Club / College" : mph >= 80 ? "Recreational" : "Developing" },
    { label: "Time to Opponent", value: `${input.flightTimeSec.toFixed(2)} s` },
  ];

  return { mph, kph, feetPerSec, chartData, breakdown, summaryStats };
}

const DEFAULTS: ServeInput = { distanceFt: 60, flightTimeSec: 0.45, dragFactor: 1.08 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TennisServeSpeedCalculator() {
  const [distance, setDistance] = useState(String(DEFAULTS.distanceFt));
  const [time, setTime] = useState(String(DEFAULTS.flightTimeSec));
  const [drag, setDrag] = useState(String(DEFAULTS.dragFactor));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<ServeResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcServe({ distanceFt: parse(distance, DEFAULTS.distanceFt), flightTimeSec: parse(time, DEFAULTS.flightTimeSec), dragFactor: parse(drag, DEFAULTS.dragFactor) }));
  const reset = () => {
    setDistance(String(DEFAULTS.distanceFt));
    setTime(String(DEFAULTS.flightTimeSec));
    setDrag(String(DEFAULTS.dragFactor));
    setResult(calcServe(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcServe(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How is serve speed estimated from flight time?", answer: "Average speed = distance ÷ flight time. Because a tennis ball decelerates from drag, the true initial (radar-style) speed is higher than the average — this calculator applies a drag adjustment (default ×1.08) to estimate initial speed." },
    { question: "What distance should I use?", answer: "From the baseline center to the far service box corner is about 60 ft (18.3 m). Measure from where you strike the ball to where it bounces or is hit. Use the full court distance only if timing to the opponent's bounce." },
    { question: "How do I measure flight time?", answer: "Record slow-motion video at 240+ fps and count frames from racket contact to bounce — divide frames by frame rate. A 0.45 s flight over 60 ft corresponds to roughly a 98 mph serve." },
    { question: "How accurate is this method?", answer: "Reasonable (±5–8 mph) with a clean measurement, but video-based timing and court geometry introduce error. Radar guns and Hawk-Eye remain the gold standards. Treat the result as an estimate, not a certified reading." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Tennis Serve Speed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Tennis Serve Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Flight Distance</label>
                <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Flight Time</label>
                <div className={inp}><input type="number" value={time} onChange={(e) => setTime(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground text-sm">s</span></div>
              </div>
            </div>

            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="text-sm text-primary font-medium text-left self-start">
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Physics</label>
                  <label className="text-sm font-medium mb-1 block">Drag Adjustment</label>
                  <div className={inp}><input type="number" value={drag} onChange={(e) => setDrag(e.target.value)} step={0.01} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Serve Speed</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.mph.toFixed(1)} <span className="text-xl font-bold text-muted-foreground">mph</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.kph.toFixed(1)} km/h · {result.feetPerSec.toFixed(1)} ft/s · {result.summaryStats[4].value}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Speed (km/h)", `${result.kph.toFixed(1)}`], ["Flight Time", `${time} s`], ["Distance", `${distance} ft`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Measurement Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Your Serve vs Player Levels</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} mph`, ""]} />
                      <Bar dataKey="mph" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Estimating Serve Speed From Flight Time</h2>
            <p>No radar gun? You can still estimate your serve speed. Record the serve in slow motion, measure the flight distance (baseline to service box ≈ 60 ft), and count the frames from contact to bounce. Speed = distance ÷ time, adjusted upward for drag because radar measures initial speed while the ball decelerates in flight.</p>
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>Recreational serves sit around 60–85 mph, club-level 85–105, college and ATP challenger level 105–125, and ATP pros routinely 125–145 mph with 150+ first serves at the very top. Placement and spin matter as much as raw speed — a 110 mph kick serve can be harder to return than a flat 125 mph ball.</p>
            <h2 className="text-2xl font-bold mb-3">Accuracy Notes</h2>
            <p>This estimate assumes a straight-line measurement and typical drag. Errors in frame counting (±2 frames at 240 fps) shift the result by several mph. Treat it as a training marker; official matches use radar or Hawk-Eye.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tennis-serve-speed-calculator" />
          <PopularCalculators exclude="/calculator/tennis-serve-speed-calculator" />
        </div>
      </div>
    </>
  );
}
