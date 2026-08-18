"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PaceResult {
  paceSecPerKm: number;
  paceSecPerMi: number;
  kmh: number;
  mph: number;
  finishSec: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function fmtPace(secPerKm: number): string {
  const total = Math.round(secPerKm);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")} /km`;
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcPace(distKm: number, timeSec: number): PaceResult {
  const paceSecPerKm = distKm > 0 ? timeSec / distKm : 0;
  const paceSecPerMi = paceSecPerKm * 1.60934;
  const kmh = timeSec > 0 ? (distKm / timeSec) * 3600 : 0;
  const mph = kmh / 1.60934;
  const finishSec = timeSec;
  const breakdown = [
    { label: "Distance", value: `${fmt(distKm, 1)} km` },
    { label: "Total Time", value: fmtTime(timeSec) },
    { label: "Pace", value: fmtPace(paceSecPerKm) },
    { label: "Pace (per mile)", value: `${fmt(paceSecPerMi / 60, 0)}:${String(Math.round(paceSecPerMi % 60)).padStart(2, "0")} /mi` },
    { label: "Speed", value: `${fmt(kmh)} km/h` },
    { label: "Speed (mph)", value: `${fmt(mph)} mph` },
  ];
  const summaryStats = [
    { label: "Pace", value: fmtPace(paceSecPerKm) },
    { label: "Speed", value: `${fmt(kmh)} km/h` },
    { label: "Per Mile", value: `${fmt(paceSecPerMi / 60, 0)}:${String(Math.round(paceSecPerMi % 60)).padStart(2, "0")} /mi` },
    { label: "Distance", value: `${fmt(distKm, 1)} km` },
    { label: "Time", value: fmtTime(timeSec) },
  ];
  const chartData = [
    { name: "Pace (s/km)", value: Number(paceSecPerKm.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Speed (km/h)", value: Number(kmh.toFixed(1)), fill: "#f59e0b" },
    { name: "Speed (mph)", value: Number(mph.toFixed(1)), fill: "#10b981" },
  ];
  return { paceSecPerKm, paceSecPerMi, kmh, mph, finishSec, breakdown, summaryStats, chartData };
}

function timeToSec(s: string): number {
  const parts = s.trim().split(":").map(Number);
  if (parts.some((v) => isNaN(v))) return NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

const DEFAULTS = { dist: "10", time: "45:00" };

export default function PaceCalculator() {
  const [dist, setDist] = useState(DEFAULTS.dist);
  const [time, setTime] = useState(DEFAULTS.time);
  const [result, setResult] = useState<PaceResult | null>(null);

  const d = parseFloat(dist);
  const t = timeToSec(time);
  const errs: string[] = [];
  if (!d || d <= 0) errs.push("Distance must be greater than 0.");
  if (isNaN(t) || t <= 0) errs.push("Time must be positive, e.g. 45:00 or 1:30:00.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPace(d, t)); };
  const reset = () => {
    setDist(DEFAULTS.dist); setTime(DEFAULTS.time);
    setResult(calcPace(10, 2700));
  };
  useEffect(() => { setResult(calcPace(10, 2700)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const presets = [
    { label: "5K", d: "5" },
    { label: "10K", d: "10" },
    { label: "Half", d: "21.1" },
    { label: "Marathon", d: "42.2" },
  ];

  const faqs = [
    { question: "What is running pace?", answer: "The time per unit of distance — typically minutes per kilometer or per mile. Slower numbers mean slower running: 6:00/km is faster than 7:00/km. It is the inverse of speed." },
    { question: "How do I convert pace to speed?", answer: "Speed = distance ÷ time. A 4:30/km pace is 60 ÷ 4.5 = 13.3 km/h. The calculator reports both, plus the per-mile pace for imperial users." },
    { question: "What is a good pace?", answer: "It depends on fitness, distance, and terrain. Recreational runners cruise 5:30–7:30/km; club runners 4:30–5:30/km; elites under 3:00/km. Compare against your own recent races rather than strangers." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pace Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pace Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Distance Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => setDist(p.d)} className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-secondary text-muted-foreground hover:bg-accent">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Distance (km)</label>
                <input type="number" value={dist} onChange={e => setDist(e.target.value)} className={inp} placeholder="10" />
              </div>
              <div>
                <label className={lbl}>Time (MM:SS or H:MM:SS)</label>
                <input type="text" value={time} onChange={e => setTime(e.target.value)} className={inp} placeholder="45:00" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pace</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPace(result.paceSecPerKm)}</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.kmh)} km/h · {fmt(result.mph)} mph · {fmt(result.paceSecPerMi / 60, 0)}:{String(Math.round(result.paceSecPerMi % 60)).padStart(2, "0")} /mi</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Speed", `${fmt(result.kmh)} km/h`], ["Per Mile", `${fmt(result.paceSecPerMi / 60, 0)}:${String(Math.round(result.paceSecPerMi % 60)).padStart(2, "0")} /mi`], ["Total Time", fmtTime(result.finishSec)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
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
                <h3 className="text-base font-bold mb-4">Pace Metrics</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Pace and speed are reciprocals — faster pace, higher speed</p>
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
            <h2 className="text-2xl font-bold mb-3">Your Pace, Your Plan</h2>
            <p>Whether pacing a 10K or planning a marathon, the fundamental numbers are the same: distance, time, and the pace connecting them. This <strong>pace calculator</strong> takes distance and time and reports pace and speed in both metric and imperial units.</p>
            <h2 className="text-2xl font-bold mb-3">The Math</h2>
            <p>Pace = time ÷ distance — 45 minutes over 10 km is 4:30 per kilometer. Speed = distance ÷ time, its reciprocal: 13.3 km/h. The per-mile pace multiplies by 1.60934 so you can speak both languages at once.</p>
            <h2 className="text-2xl font-bold mb-3">Use It Forward</h2>
            <p>Once you know a sustainable pace, plan any finish: a 4:30/km runner covers the half marathon in about 1:35. Keep the pace honest over the first half of a race — most runners who blow up went out faster than this calculator would have advised.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pace-calculator" />
          <PopularCalculators exclude="/calculator/pace-calculator" />
        </div>
      </div>
    </>
  );
}
