"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface RlInput {
  l: number; // henries
  r: number; // ohms
}

interface RlResult {
  tau: number; // seconds
  cutoffFreq: number; // Hz
  chartData: { t: string; current: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtTime(s: number): string {
  if (s >= 1) return `${s.toFixed(2)} s`;
  if (s >= 0.001) return `${(s * 1000).toFixed(2)} ms`;
  return `${(s * 1000000).toFixed(2)} µs`;
}

function calcRl(input: RlInput): RlResult {
  const { l, r } = input;
  const tau = l / r;
  const cutoffFreq = r / (2 * Math.PI * l);

  const chartData = [0, 0.5, 1, 1.5, 2, 3, 4, 5].map((t) => ({
    t: `${t}τ`,
    current: 1 - Math.exp(-t),
  }));

  const breakdown = [
    { label: "Inductance (L)", value: `${l < 1 ? l * 1000 : l} ${l < 1 ? "mH" : "H"}` },
    { label: "Resistance (R)", value: `${r.toLocaleString()} Ω` },
    { label: "Time Constant (τ = L ÷ R)", value: fmtTime(tau) },
    { label: "Current at 1τ (63.2% of max)", value: fmtTime(tau) },
    { label: "Current at 3τ (95.0%)", value: fmtTime(3 * tau) },
    { label: "Current at 5τ (99.3%)", value: fmtTime(5 * tau) },
    { label: "Cutoff Frequency (f_c = R/2πL)", value: `${cutoffFreq.toFixed(2)} Hz` },
  ];

  const summaryStats = [
    { label: "Time Constant (τ)", value: fmtTime(tau) },
    { label: "Current at 1τ", value: "63.2%" },
    { label: "Current at 3τ", value: "95.0%" },
    { label: "Current at 5τ", value: "99.3%" },
    { label: "Cutoff Frequency", value: `${cutoffFreq.toFixed(2)} Hz` },
    { label: "Formula", value: "τ = L ÷ R" },
  ];

  return { tau, cutoffFreq, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RlTimeConstantCalculator() {
  const [l, setL] = useState("0.1");
  const [r, setR] = useState("10");
  const [result, setResult] = useState<RlResult | null>(null);

  const calculate = () =>
    setResult(
      calcRl({
        l: Math.max(1e-9, parseFloat(l) || 0.1),
        r: Math.max(0.001, parseFloat(r) || 10),
      })
    );
  const reset = () => {
    setL("0.1");
    setR("10");
    setResult(calcRl({ l: 0.1, r: 10 }));
  };
  useEffect(() => {
    setResult(calcRl({ l: 0.1, r: 10 }));
  }, []);

  const faqs = [
    { question: "What is the RL time constant?", answer: "The time constant τ = L/R is how long an inductor takes to reach 63.2% of its final current after voltage is applied. It is the magnetic counterpart to the RC circuit's capacitor charging." },
    { question: "Why does the inductor resist current changes?", answer: "An inductor opposes changes in current by generating a back EMF proportional to the rate of change. When voltage is first applied, current starts at zero and rises exponentially toward V/R, limited by this inductive opposition." },
    { question: "What happens when the switch opens?", answer: "The inductor tries to keep current flowing, producing a potentially large voltage spike — L·(di/dt). This is why relay coils need flyback diodes and why inductive loads can arc at switches." },
    { question: "How does an RL circuit filter signals?", answer: "The inductor's impedance grows with frequency (Z = 2πfL), so an RL circuit forms a high-pass or low-pass filter with cutoff f_c = R/(2πL). Above f_c, the inductor blocks; below, it passes." },
    { question: "Where are RL circuits used?", answer: "Power-supply smoothing (inductors in series), speaker crossovers, RF filters, and every relay and solenoid — the time constant governs how fast the magnetic field builds and releases." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "RL Time Constant Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">RL Time Constant Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Inductance (H)</label>
                <div className={inp}><input type="number" value={l} onChange={(e) => setL(e.target.value)} className={ci} min={1e-9} step={0.001} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Resistance (Ω)</label>
                <div className={inp}><input type="number" value={r} onChange={(e) => setR(e.target.value)} className={ci} min={0.001} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Common values: 100 mH = 0.1 H · 10 mH = 0.01 H · 1 mH = 0.001 H</p>

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time Constant (τ = L ÷ R)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmtTime(result.tau)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Current reaches 63.2% of maximum in 1τ · 95% in 3τ · 99.3% in 5τ</div>
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
                  <h3 className="text-base font-bold mb-4">Current Rise Curve</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 1.05]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
                      <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Current"]} />
                      <ReferenceLine x="1τ" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "63.2%", position: "top", fontSize: 11, fill: "#b45309" }} />
                      <Line type="monotone" dataKey="current" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Current through the inductor: I(t) = (V/R) × (1 − e^(−t/τ)), plotted as % of the maximum over 0–5τ.</p>
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
            <h2 className="text-2xl font-bold mb-3">The RL Time Constant</h2>
            <p>An inductor and resistor in series form the magnetic mirror of the RC circuit. When voltage is applied, the inductor's back EMF initially blocks current; over time the current rises exponentially toward its steady value V/R with time constant <strong>τ = L/R</strong>.</p>
            <h2 className="text-2xl font-bold mb-3">Energy in the Magnetic Field</h2>
            <p>The inductor stores energy in its magnetic field, E = ½LI². When the circuit is interrupted, that energy must go somewhere — producing the flyback voltage spikes that make relay coils dangerous to switch without protection. This same principle makes inductive kickback the bane of switch designers.</p>
            <h2 className="text-2xl font-bold mb-3">RL Circuits in Frequency</h2>
            <p>The inductor's impedance, Z_L = 2πfL, grows with frequency, so an RL pair filters by passing or blocking based on f_c = R/(2πL). Combined with the RC filter's behavior, these two networks are the building blocks of every analog equalizer, crossover, and RF front end.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rl-time-constant-calculator" />
          <PopularCalculators exclude="/calculator/rl-time-constant-calculator" />
        </div>
      </div>
    </>
  );
}
