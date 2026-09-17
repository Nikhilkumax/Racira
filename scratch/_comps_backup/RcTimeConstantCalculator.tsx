"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface RcInput {
  r: number; // ohms
  c: number; // farads
}

interface RcResult {
  tau: number; // seconds
  cutoffFreq: number; // Hz
  chargeAt1Tau: number;
  chargeAt2Tau: number;
  chargeAt3Tau: number;
  chargeAt5Tau: number;
  chartData: { t: string; charge: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtTime(s: number): string {
  if (s >= 1) return `${s.toFixed(2)} s`;
  if (s >= 0.001) return `${(s * 1000).toFixed(2)} ms`;
  return `${(s * 1000000).toFixed(2)} µs`;
}

function calcRc(input: RcInput): RcResult {
  const { r, c } = input;
  const tau = r * c;
  const cutoffFreq = 1 / (2 * Math.PI * tau);

  const chartData = [0, 0.5, 1, 1.5, 2, 3, 4, 5].map((t) => ({
    t: `${t}τ`,
    charge: 1 - Math.exp(-t),
  }));

  const breakdown = [
    { label: "Resistance (R)", value: `${r.toLocaleString()} Ω` },
    { label: "Capacitance (C)", value: `${c < 0.001 ? c * 1000000 : c * 1000} ${c < 0.001 ? "µF" : "mF"}` },
    { label: "Time Constant (τ = R·C)", value: fmtTime(tau) },
    { label: "Charge at 1τ (63.2%)", value: fmtTime(tau) },
    { label: "Charge at 3τ (95.0%)", value: fmtTime(3 * tau) },
    { label: "Charge at 5τ (99.3%)", value: fmtTime(5 * tau) },
    { label: "Cutoff Frequency (f_c = 1/2πRC)", value: `${cutoffFreq.toFixed(2)} Hz` },
  ];

  const summaryStats = [
    { label: "Time Constant (τ)", value: fmtTime(tau) },
    { label: "Charge at 1τ", value: "63.2%" },
    { label: "Charge at 3τ", value: "95.0%" },
    { label: "Charge at 5τ", value: "99.3%" },
    { label: "Cutoff Frequency", value: `${cutoffFreq.toFixed(2)} Hz` },
    { label: "Formula", value: "τ = R × C" },
  ];

  return { tau, cutoffFreq, chargeAt1Tau: 0.632, chargeAt2Tau: 0.865, chargeAt3Tau: 0.95, chargeAt5Tau: 0.993, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RcTimeConstantCalculator() {
  const [r, setR] = useState("10000");
  const [c, setC] = useState("0.0001");
  const [result, setResult] = useState<RcResult | null>(null);

  const calculate = () =>
    setResult(
      calcRc({
        r: Math.max(1, parseFloat(r) || 10000),
        c: Math.max(1e-12, parseFloat(c) || 0.0001),
      })
    );
  const reset = () => {
    setR("10000");
    setC("0.0001");
    setResult(calcRc({ r: 10000, c: 0.0001 }));
  };
  useEffect(() => {
    setResult(calcRc({ r: 10000, c: 0.0001 }));
  }, []);

  const faqs = [
    { question: "What is the RC time constant?", answer: "The time constant τ = R·C is the time for a capacitor to charge to 63.2% of the supply voltage (or discharge to 36.8%). It is the single number that characterizes how fast an RC circuit responds." },
    { question: "When is a capacitor considered fully charged?", answer: "After 5τ the capacitor reaches 99.3% of the supply — for practical purposes, full. One τ gives 63.2%, three τ give 95%. The approach is exponential and never exactly reaches 100%." },
    { question: "What is the cutoff frequency?", answer: "For an RC filter, f_c = 1/(2πRC) is where the output falls to 70.7% (−3 dB) of the input. Below f_c a low-pass filter passes signals; above it, they are attenuated — the basis of tone controls and noise filtering." },
    { question: "How do I choose R and C?", answer: "The product R·C sets the time constant; the ratio sets current draw and impedance. For a 1-second delay, every combination with R·C = 1 works — 1 MΩ × 1 µF is a classic choice that wastes little current." },
    { question: "Where are RC circuits used?", answer: "Debounce circuits for buttons, timing delays, camera flash chargers, audio filters, power-supply smoothing, and the internal clocks of old computers. The 555 timer chip is essentially a switchable RC circuit." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "RC Time Constant Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">RC Time Constant Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Resistance (Ω)</label>
                <div className={inp}><input type="number" value={r} onChange={(e) => setR(e.target.value)} className={ci} min={1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Capacitance (F)</label>
                <div className={inp}><input type="number" value={c} onChange={(e) => setC(e.target.value)} className={ci} min={1e-12} step={0.00001} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Common values: 100 µF = 0.0001 F · 1 µF = 0.000001 F · 10 nF = 0.00000001 F</p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time Constant (τ = R·C)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmtTime(result.tau)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Reaches 63.2% charge in 1τ · 95% in 3τ · 99.3% in 5τ</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["1τ (63.2%)", fmtTime(result.tau)], ["3τ (95%)", fmtTime(3 * result.tau)], ["5τ (99.3%)", fmtTime(5 * result.tau)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Capacitor Charge Curve</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 1.05]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
                      <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Charge"]} />
                      <ReferenceLine x="1τ" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "63.2%", position: "top", fontSize: 11, fill: "#b45309" }} />
                      <Line type="monotone" dataKey="charge" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Voltage across the capacitor: V(t) = Vin × (1 − e^(−t/τ)), plotted as % of Vin over 0–5τ.</p>
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
            <h2 className="text-2xl font-bold mb-3">The RC Time Constant</h2>
            <p>A resistor and capacitor in series form the most important circuit in electronics. When a voltage is applied, the capacitor charges through the resistor along an exponential curve, and the time constant τ = R·C sets the pace: after one τ the voltage has reached 63.2% of the supply, and after five τ it is practically full.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Exponential?</h2>
            <p>The charging current is proportional to the remaining voltage difference, so the closer the capacitor gets to full, the slower it charges — the hallmark of exponential approach. The same curve governs discharging, cooling, and every 'relaxation' process, from camera flashes to the decay of a capacitor's stored energy.</p>
            <h2 className="text-2xl font-bold mb-3">Time Constants and Filters</h2>
            <p>Viewed in the frequency domain, the same R·C product defines the cutoff frequency f_c = 1/(2πRC): the point where the circuit attenuates a signal to 70.7%. Below f_c a low-pass filter passes, above it blocks — the physics behind every audio tone control, anti-aliasing filter, and radio receiver.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rc-time-constant-calculator" />
          <PopularCalculators exclude="/calculator/rc-time-constant-calculator" />
        </div>
      </div>
    </>
  );
}
