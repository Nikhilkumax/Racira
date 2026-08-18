"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CadenceInput {
  steps: number;
  minutes: number;
  distanceMiles: number;
}

interface CadenceResult {
  cadence: number;
  strideLengthFt: number;
  stepsPerMile: number;
  paceMinPerMile: number;
  chartData: { name: string; spm: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCadence(input: CadenceInput): CadenceResult {
  const cadence = input.minutes > 0 ? input.steps / input.minutes : 0;
  const totalFeet = input.distanceMiles > 0 ? input.distanceMiles * 5280 : 0;
  const strideLengthFt = input.steps > 0 && totalFeet > 0 ? totalFeet / input.steps : 0;
  const stepsPerMile = input.distanceMiles > 0 ? input.steps / input.distanceMiles : 0;
  const paceMinPerMile = input.distanceMiles > 0 ? input.minutes / input.distanceMiles : 0;

  const chartData = [
    { name: "Your Cadence", spm: Number(cadence.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Recreational", spm: 155, fill: "#94a3b8" },
    { name: "Typical", spm: 170, fill: "#94a3b8" },
    { name: "Ideal Target", spm: 180, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Steps Taken", value: `${input.steps.toLocaleString()}` },
    { label: "Run Duration", value: `${input.minutes} min` },
    { label: "Distance", value: `${input.distanceMiles} mi` },
    { label: "Cadence", value: `${cadence.toFixed(0)} spm` },
    { label: "Stride Length", value: strideLengthFt > 0 ? `${strideLengthFt.toFixed(2)} ft` : "—" },
    { label: "Steps per Mile", value: stepsPerMile > 0 ? `${stepsPerMile.toFixed(0)}` : "—" },
    { label: "Pace", value: `${Math.floor(paceMinPerMile)}:${String(Math.round((paceMinPerMile % 1) * 60)).padStart(2, "0")} /mi` },
  ];

  const summaryStats = [
    { label: "Cadence", value: `${cadence.toFixed(0)} spm` },
    { label: "Stride Length", value: strideLengthFt > 0 ? `${strideLengthFt.toFixed(2)} ft` : "—" },
    { label: "Steps per Mile", value: stepsPerMile > 0 ? `${stepsPerMile.toFixed(0)}` : "—" },
    { label: "Pace", value: `${Math.floor(paceMinPerMile)}:${String(Math.round((paceMinPerMile % 1) * 60)).padStart(2, "0")} /mi` },
    { label: "Distance", value: `${input.distanceMiles} mi` },
    { label: "Duration", value: `${input.minutes} min` },
  ];

  return { cadence, strideLengthFt, stepsPerMile, paceMinPerMile, chartData, breakdown, summaryStats };
}

const DEFAULTS: CadenceInput = { steps: 5100, minutes: 30, distanceMiles: 3.1 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RunningCadenceCalculator() {
  const [steps, setSteps] = useState(String(DEFAULTS.steps));
  const [minutes, setMinutes] = useState(String(DEFAULTS.minutes));
  const [distance, setDistance] = useState(String(DEFAULTS.distanceMiles));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<CadenceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcCadence({ steps: parse(steps, DEFAULTS.steps), minutes: parse(minutes, DEFAULTS.minutes), distanceMiles: parse(distance, DEFAULTS.distanceMiles) }));
  const reset = () => {
    setSteps(String(DEFAULTS.steps));
    setMinutes(String(DEFAULTS.minutes));
    setDistance(String(DEFAULTS.distanceMiles));
    setResult(calcCadence(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcCadence(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a good running cadence?", answer: "Elite distance runners typically run at 180 steps per minute (spm) or higher. Recreational runners often sit at 150–165 spm. The 180 benchmark reduces over-striding and impact loading, which lowers injury risk — but cadence is personal and should rise gradually." },
    { question: "How do I count my cadence?", answer: "Count the number of times one foot lands in 30 seconds and double it (or count both feet for a full minute). Most GPS watches and running apps report cadence automatically." },
    { question: "Should I force 180 spm?", answer: "No. Increasing cadence by 5–10% via shorter, quicker steps is a safe approach. Drastic jumps change your gait and can introduce new injuries. A metronome app at your target cadence helps you adapt gradually." },
    { question: "What is stride length?", answer: "Stride length is the distance covered per step (distance ÷ steps). Cadence and stride length trade off: at a given speed, a higher cadence means a shorter stride, which typically means less braking force and lower injury risk." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Running Cadence Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Running Cadence Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Steps Taken</label>
                <div className={inp}><input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">steps</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Run Duration</label>
                <div className={inp}><input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
              </div>
            </div>

            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="text-sm text-primary font-medium text-left self-start">
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Stride Metrics</label>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Running Cadence</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.cadence.toFixed(0)} <span className="text-xl font-bold text-muted-foreground">spm</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Stride {result.strideLengthFt > 0 ? `${result.strideLengthFt.toFixed(2)} ft` : "—"} · {result.stepsPerMile > 0 ? `${result.stepsPerMile.toFixed(0)}` : "—"} steps/mi · {result.breakdown[6].value} pace</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Stride Length", result.strideLengthFt > 0 ? `${result.strideLengthFt.toFixed(2)} ft` : "—"], ["Steps per Mile", result.stepsPerMile > 0 ? `${result.stepsPerMile.toFixed(0)}` : "—"], ["Pace", result.breakdown[6].value]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Run Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Cadence vs Benchmarks</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[120, 190]} />
                      <Tooltip formatter={(v: number) => [`${v} spm`, ""]} />
                      <Bar dataKey="spm" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Why Cadence Matters</h2>
            <p>Cadence — steps per minute — is one of the most studied variables in running biomechanics. Higher cadence is associated with a shorter stride, less vertical oscillation, and a foot strike closer under the body, all of which reduce braking forces and lower injury risk.</p>
            <h2 className="text-2xl font-bold mb-3">The 180 Benchmark</h2>
            <p>The 180 spm figure comes from observations of elite distance runners at the 1984 Olympics. It is a useful target, not a law — taller runners and those running uphill or on trails naturally run slightly lower. Focus on progress, not perfection.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Your Cadence</h2>
            <p>Increase by about 5% at a time using shorter, quicker steps while keeping effort constant. A metronome app at 5–10 spm above your current rate helps. Re-measure every few weeks: cadence gains tend to stick once your body adapts.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/running-cadence-calculator" />
          <PopularCalculators exclude="/calculator/running-cadence-calculator" />
        </div>
      </div>
    </>
  );
}
