"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface TssInput {
  ftp: number;
  normalizedPower: number;
  durationMin: number;
}

interface TssResult {
  if_: number;
  tss: number;
  weeklyZone: string;
  chartData: { name: string; tss: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTss(input: TssInput): TssResult {
  const if_ = input.ftp > 0 ? input.normalizedPower / input.ftp : 0;
  const seconds = input.durationMin * 60;
  const tss = input.ftp > 0 ? ((seconds * input.normalizedPower * if_) / (input.ftp * 3600)) * 100 : 0;

  const weeklyZone = tss < 150 ? "Low / Recovery" : tss < 300 ? "Moderate / Base" : tss < 450 ? "High / Build" : "Very High / Peak";

  const chartData = [
    { name: "This Workout", tss: Number(tss.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Low (≤150)", tss: 150, fill: "#94a3b8" },
    { name: "Moderate (300)", tss: 300, fill: "#94a3b8" },
    { name: "High (450)", tss: 450, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Functional Threshold Power", value: `${input.ftp} W` },
    { label: "Normalized Power", value: `${input.normalizedPower} W` },
    { label: "Duration", value: `${input.durationMin} min` },
    { label: "Intensity Factor (IF)", value: `${if_.toFixed(2)}` },
    { label: "Training Stress Score", value: `${tss.toFixed(0)}` },
    { label: "Weekly Training Load Zone", value: weeklyZone },
  ];

  const summaryStats = [
    { label: "TSS", value: `${tss.toFixed(0)}` },
    { label: "Intensity Factor", value: `${if_.toFixed(2)}` },
    { label: "Normalized Power", value: `${input.normalizedPower} W` },
    { label: "Duration", value: `${input.durationMin} min` },
    { label: "Work Zone", value: weeklyZone },
    { label: "4-Wk Projected Load", value: `${(tss * 4).toFixed(0)}` },
  ];

  return { if_, tss, weeklyZone, chartData, breakdown, summaryStats };
}

const DEFAULTS: TssInput = { ftp: 250, normalizedPower: 200, durationMin: 60 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TssCalculator() {
  const [ftp, setFtp] = useState(String(DEFAULTS.ftp));
  const [np, setNp] = useState(String(DEFAULTS.normalizedPower));
  const [duration, setDuration] = useState(String(DEFAULTS.durationMin));
  const [result, setResult] = useState<TssResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcTss({ ftp: parse(ftp, DEFAULTS.ftp), normalizedPower: parse(np, DEFAULTS.normalizedPower), durationMin: parse(duration, DEFAULTS.durationMin) }));
  const reset = () => {
    setFtp(String(DEFAULTS.ftp));
    setNp(String(DEFAULTS.normalizedPower));
    setDuration(String(DEFAULTS.durationMin));
    setResult(calcTss(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcTss(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is TSS?", answer: "Training Stress Score quantifies the training load of a workout: TSS = (seconds × NP × IF) ÷ (FTP × 3600) × 100. It combines duration and intensity into a single number, where 100 points roughly equals one hour at functional threshold pace." },
    { question: "What is Intensity Factor?", answer: "IF = Normalized Power ÷ FTP. It expresses how hard a workout was relative to your threshold: 0.75–0.85 is a moderate aerobic ride, 0.85–0.95 is tempo, and above 1.0 is threshold-plus effort." },
    { question: "How much TSS is too much?", answer: "As a rough weekly guide: under 150 is recovery, 150–300 supports base fitness, 300–450 is a solid build week, and above 450 is peak volume best used sparingly. Ramp weekly load by no more than 10–15% to avoid overtraining." },
    { question: "How is normalized power different from average power?", answer: "Normalized Power weights hard efforts more heavily than steady power, reflecting the physiological cost of variable intensity. A ride with surges produces a higher NP than average power — which is why TSS uses NP." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "TSS Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">TSS Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">FTP (Functional Threshold Power)</label>
                <div className={inp}><input type="number" value={ftp} onChange={(e) => setFtp(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">W</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Normalized Power</label>
                <div className={inp}><input type="number" value={np} onChange={(e) => setNp(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">W</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration</label>
                <div className={inp}><input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Training Stress Score</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.tss.toFixed(0)} <span className="text-xl font-bold text-muted-foreground">TSS</span></div>
                  <div className="text-sm text-muted-foreground mt-1">IF {result.if_.toFixed(2)} · {result.weeklyZone} weekly zone</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Intensity Factor", `${result.if_.toFixed(2)}`], ["Duration", `${DEFAULTS.durationMin} min`], ["Work Zone", result.weeklyZone]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Workout Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">TSS vs Weekly Load Zones</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} TSS`, ""]} />
                      <Bar dataKey="tss" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">What TSS Measures</h2>
            <p>Training Stress Score converts a workout's duration and intensity into one number. Because it uses Normalized Power, interval sessions — which cost more physiologically than steady rides at the same average power — score higher. One hundred TSS points approximates an hour at threshold effort.</p>
            <h2 className="text-2xl font-bold mb-3">Using TSS in Training</h2>
            <p>Track weekly TSS to manage load: under 150 is recovery, 150–300 builds base, 300–450 is a strong build week, and 450+ is peak volume. Increase weekly load gradually (10–15% max) and schedule recovery weeks every third or fourth week.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations</h2>
            <p>TSS assumes your FTP is accurate — test it regularly (20–60 minute efforts). It also models cycling-specific stress; running and strength training add load that TSS does not capture, so combine metrics when training across disciplines.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tss-calculator" />
          <PopularCalculators exclude="/calculator/tss-calculator" />
        </div>
      </div>
    </>
  );
}
