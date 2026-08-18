"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface StrideInput {
  distance: number;
  distanceUnit: "mi" | "km";
  steps: number;
  durationMin: number;
}

interface StrideResult {
  strideFt: number;
  strideCm: number;
  stepsPerMile: number;
  cadence: number;
  chartData: { name: string; ft: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcStride(input: StrideInput): StrideResult {
  const feet = input.distanceUnit === "mi" ? input.distance * 5280 : input.distance * 3280.84;
  const strideFt = input.steps > 0 ? feet / input.steps : 0;
  const strideCm = strideFt * 30.48;
  const stepsPerMile = input.distance > 0 ? input.steps / input.distance : 0;
  const cadence = input.durationMin > 0 ? input.steps / input.durationMin : 0;

  const chartData = [
    { name: "Your Stride", ft: Number(strideFt.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Walking", ft: 2.5, fill: "#94a3b8" },
    { name: "Jogging", ft: 3.3, fill: "#94a3b8" },
    { name: "Running", ft: 4.5, fill: "#94a3b8" },
    { name: "Sprinting", ft: 6.0, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Distance", value: `${input.distance} ${input.distanceUnit}` },
    { label: "Steps Taken", value: `${input.steps.toLocaleString()}` },
    { label: "Duration", value: `${input.durationMin} min` },
    { label: "Stride Length", value: `${strideFt.toFixed(2)} ft` },
    { label: "Stride Length (Metric)", value: `${strideCm.toFixed(1)} cm` },
    { label: "Steps per Mile", value: `${stepsPerMile.toFixed(0)}` },
    { label: "Cadence (if duration given)", value: cadence > 0 ? `${cadence.toFixed(0)} spm` : "—" },
  ];

  const summaryStats = [
    { label: "Stride Length", value: `${strideFt.toFixed(2)} ft` },
    { label: "Stride Length", value: `${strideCm.toFixed(1)} cm` },
    { label: "Steps per Mile", value: `${stepsPerMile.toFixed(0)}` },
    { label: "Cadence", value: cadence > 0 ? `${cadence.toFixed(0)} spm` : "—" },
    { label: "Distance", value: `${input.distance} ${input.distanceUnit}` },
    { label: "Steps Taken", value: `${input.steps.toLocaleString()}` },
  ];

  return { strideFt, strideCm, stepsPerMile, cadence, chartData, breakdown, summaryStats };
}

const DEFAULTS: StrideInput = { distance: 3.1, distanceUnit: "mi", steps: 5100, durationMin: 30 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RunningStrideLengthCalculator() {
  const [distance, setDistance] = useState(String(DEFAULTS.distance));
  const [distanceUnit, setDistanceUnit] = useState<StrideInput["distanceUnit"]>(DEFAULTS.distanceUnit);
  const [steps, setSteps] = useState(String(DEFAULTS.steps));
  const [duration, setDuration] = useState(String(DEFAULTS.durationMin));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<StrideResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcStride({ distance: parse(distance, DEFAULTS.distance), distanceUnit, steps: parse(steps, DEFAULTS.steps), durationMin: parse(duration, DEFAULTS.durationMin) }));
  const reset = () => {
    setDistance(String(DEFAULTS.distance));
    setDistanceUnit(DEFAULTS.distanceUnit);
    setSteps(String(DEFAULTS.steps));
    setDuration(String(DEFAULTS.durationMin));
    setResult(calcStride(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcStride(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a normal stride length?", answer: "Typical stride lengths by effort: walking about 2.5 ft, jogging about 3.3 ft, running about 4.5 ft, and sprinting up to 6 ft or more. Stride length scales with height, leg length, and speed — taller runners naturally have longer strides." },
    { question: "How do I calculate stride length?", answer: "Run a known distance, count your steps (or use a foot pod/watch), then divide distance by steps. This calculator handles miles or kilometers and also reports steps per mile and cadence when you enter duration." },
    { question: "Should I lengthen my stride to run faster?", answer: "Usually not — increasing cadence (shorter, quicker steps) is safer and more efficient than over-striding. Over-striding creates braking forces that raise injury risk. Let stride length increase naturally as speed rises." },
    { question: "How does height affect stride?", answer: "As a rough guide, running stride length is often close to 0.7–0.85× height depending on pace. Individual biomechanics vary, so your measured value is more useful than a formula estimate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Running Stride Length Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Running Stride Length Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Distance</label>
                <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} />
                  <select value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value as StrideInput["distanceUnit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="mi">mi</option><option value="km">km</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Steps Taken</label>
                <div className={inp}><input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="text-sm text-primary font-medium text-left self-start">
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Cadence</label>
                  <label className="text-sm font-medium mb-1 block">Duration</label>
                  <div className={inp}><input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Average Stride Length</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.strideFt.toFixed(2)} <span className="text-xl font-bold text-muted-foreground">ft</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.strideCm.toFixed(1)} cm · {result.stepsPerMile.toFixed(0)} steps/mi{result.cadence > 0 ? ` · ${result.cadence.toFixed(0)} spm` : ""}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Stride (cm)", `${result.strideCm.toFixed(1)} cm`], ["Steps per Mile", `${result.stepsPerMile.toFixed(0)}`], ["Cadence", result.cadence > 0 ? `${result.cadence.toFixed(0)} spm` : "—"]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Your Stride vs Typical Effort Levels</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)} ft`, ""]} />
                      <Bar dataKey="ft" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">What Stride Length Tells You</h2>
            <p>Stride length — the distance covered per step — is one half of the speed equation (speed = cadence × stride length). It reflects your height, leg length, running mechanics, and pace. Measuring it over a known distance is the only accurate way to know yours.</p>
            <h2 className="text-2xl font-bold mb-3">The Cadence Trade-Off</h2>
            <p>At a fixed speed, stride length and cadence move inversely. Elite runners favor higher cadence (180 spm) with shorter strides because it reduces braking force and ground contact time. Increasing your cadence by 5–10% is a safer improvement path than forcing a longer stride.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring Accurately</h2>
            <p>Run a flat, measured course (track or GPS-verified distance), count total steps, and divide. Repeat over several runs — the average is more reliable than a single sample, especially at different paces.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/running-stride-length-calculator" />
          <PopularCalculators exclude="/calculator/running-stride-length-calculator" />
        </div>
      </div>
    </>
  );
}
