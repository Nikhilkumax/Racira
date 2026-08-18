"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PendulumInput {
  length: number; // meters
  gravity: number; // m/s^2
}

interface PendulumResult {
  period: number; // seconds
  frequency: number; // Hz
  angularFreq: number; // rad/s
  swingsPerMin: number;
  chartData: { name: string; period: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPendulum(input: PendulumInput): PendulumResult {
  const { length, gravity } = input;
  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const frequency = 1 / period;
  const angularFreq = Math.sqrt(gravity / length);
  const swingsPerMin = 60 / period;

  // Period scales with sqrt(L): show how it grows across lengths
  const factors = [0.5, 1, 1.5, 2];
  const chartData = factors.map((f, i) => ({
    name: `${f}×L`,
    period: 2 * Math.PI * Math.sqrt((length * f) / gravity),
    fill: i === factors.length - 1 ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Pendulum Length", value: `${length} m` },
    { label: "Gravity", value: `${gravity} m/s²` },
    { label: "Period (T)", value: `${period.toFixed(3)} s` },
    { label: "Frequency (f)", value: `${frequency.toFixed(3)} Hz` },
    { label: "Angular Frequency (ω)", value: `${angularFreq.toFixed(3)} rad/s` },
    { label: "Swings per Minute", value: `${swingsPerMin.toFixed(1)}` },
  ];

  const summaryStats = [
    { label: "Period (T)", value: `${period.toFixed(3)} s` },
    { label: "Frequency (f)", value: `${frequency.toFixed(3)} Hz` },
    { label: "Angular Freq (ω)", value: `${angularFreq.toFixed(3)} rad/s` },
    { label: "Swings / Minute", value: `${swingsPerMin.toFixed(1)}` },
    { label: "Formula", value: "T = 2π√(L/g)" },
    { label: "Valid for", value: "Small angles (θ < 15°)" },
  ];

  return { period, frequency, angularFreq, swingsPerMin, chartData, breakdown, summaryStats };
}

const DEFAULTS: PendulumInput = { length: 1, gravity: 9.81 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SimplePendulumCalculator() {
  const [length, setLength] = useState(String(DEFAULTS.length));
  const [gravity, setGravity] = useState(String(DEFAULTS.gravity));
  const [result, setResult] = useState<PendulumResult | null>(null);

  const calculate = () =>
    setResult(
      calcPendulum({
        length: Math.max(0.01, parseFloat(length) || DEFAULTS.length),
        gravity: Math.max(0.1, parseFloat(gravity) || DEFAULTS.gravity),
      })
    );
  const reset = () => {
    setLength(String(DEFAULTS.length));
    setGravity(String(DEFAULTS.gravity));
    setResult(calcPendulum(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPendulum(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the period of a pendulum?", answer: "The period is the time for one complete back-and-forth swing. For small angles it is T = 2π√(L/g) — it depends only on the length and gravity, not on the mass of the bob or the amplitude. This is why a grandfather clock keeps time regardless of how far the pendulum swings." },
    { question: "Why doesn't mass affect the period?", answer: "The restoring force from gravity and the inertia of the bob scale together, so they cancel. A heavier bob feels more force but also resists motion more — the ratio is unchanged, and the period stays identical regardless of mass." },
    { question: "When does the formula break down?", answer: "The small-angle approximation T = 2π√(L/g) is accurate to better than 1% for amplitudes under about 15°. For large swings the period lengthens slightly; the exact value requires an elliptic integral." },
    { question: "What happens on the Moon?", answer: "Gravity is about 1.62 m/s² there — roughly one sixth of Earth's. Since the period is inversely proportional to √g, a 1-meter pendulum that takes 2.0 s on Earth takes about 4.9 s on the Moon." },
    { question: "How is this used in real life?", answer: "Pendulum clocks, metronomes, seismic instruments, and playground swings all rely on this physics. The period formula is also how the length of a clock's pendulum is chosen to tick exactly once per second." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Simple Pendulum Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Simple Pendulum Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Length (m)</label>
                <div className={inp}><input type="number" value={length} onChange={(e) => setLength(e.target.value)} className={ci} min={0.01} step={0.01} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Gravity (m/s²)</label>
                <div className={inp}><input type="number" value={gravity} onChange={(e) => setGravity(e.target.value)} className={ci} min={0.1} step={0.01} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Earth ≈ 9.81, Moon ≈ 1.62, Mars ≈ 3.71, Jupiter ≈ 24.79 m/s².</p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Period (T)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.period.toFixed(3)} <span className="text-2xl text-muted-foreground">s</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.swingsPerMin.toFixed(1)} complete swings per minute</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Frequency", `${result.frequency.toFixed(3)} Hz`], ["Angular ω", `${result.angularFreq.toFixed(3)} rad/s`], ["Swings/min", `${result.swingsPerMin.toFixed(1)}`]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Period vs Length (√L scaling)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2) + " s", "Period"]} />
                      <Bar dataKey="period" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Quadrupling the length only doubles the period — the hallmark √L relationship.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Physics of a Simple Pendulum</h2>
            <p>A simple pendulum is a mass on the end of a massless, rigid, frictionless string swinging under gravity. For small displacements the restoring force is proportional to the displacement itself, which produces perfect harmonic motion with a period that is independent of the mass and amplitude.</p>
            <h2 className="text-2xl font-bold mb-3">The Period Formula</h2>
            <p><strong>T = 2π√(L/g)</strong> — the period depends on the square root of the length divided by gravity. Doubling the length multiplies the period by √2 ≈ 1.41; cutting gravity to a quarter doubles the period. This square-root behavior is what the chart visualizes.</p>
            <h2 className="text-2xl font-bold mb-3">From Swings to Clocks</h2>
            <p>Because the period is nearly constant regardless of how wide the pendulum swings, it became the world's first reliable timekeeper. A seconds pendulum — one that ticks exactly once per second — needs a length of about 0.994 m on Earth, a fact embedded in the design of every pendulum clock since Huygens built the first in 1656.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/simple-pendulum-calculator" />
          <PopularCalculators exclude="/calculator/simple-pendulum-calculator" />
        </div>
      </div>
    </>
  );
}
