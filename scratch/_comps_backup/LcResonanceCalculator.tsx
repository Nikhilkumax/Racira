"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

interface LcResult {
  inductance: number;
  capacitance: number;
  resistance: number;
  f0: number;
  omega: number;
  period: number;
  impedance: number;
  q: number;
  bandwidth: number;
  curve: { freq: number; xl: number; xc: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function freqStr(hz: number): string {
  if (hz >= 1e9) return `${fmt(hz / 1e9, 3)} GHz`;
  if (hz >= 1e6) return `${fmt(hz / 1e6, 3)} MHz`;
  if (hz >= 1e3) return `${fmt(hz / 1e3, 3)} kHz`;
  return `${fmt(hz, 2)} Hz`;
}

function calcLc(L: number, C: number, R: number): LcResult {
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const omega = 2 * Math.PI * f0;
  const period = 1 / f0;
  const impedance = Math.sqrt(L / C);
  const q = R > 0 ? impedance / R : 0;
  const bandwidth = q > 0 ? f0 / q : 0;

  // reactance curves across a decade around resonance
  const curve: { freq: number; xl: number; xc: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const f = f0 * Math.pow(10, (i - 50) / 50);
    curve.push({ freq: f, xl: 2 * Math.PI * f * L, xc: 1 / (2 * Math.PI * f * C) });
  }

  const breakdown = [
    { label: "Inductance (L)", value: `${fmt(L * 1e6, 2)} µH` },
    { label: "Capacitance (C)", value: `${fmt(C * 1e12, 2)} pF` },
    { label: "Resonant Frequency f₀", value: freqStr(f0) },
    { label: "Angular Frequency ω₀", value: `${fmt(omega / 1e6, 3)} Mrad/s` },
    { label: "Oscillation Period T", value: `${fmt(period * 1e9, 2)} ns` },
    { label: "Characteristic Impedance", value: `${fmt(impedance, 1)} Ω` },
    { label: "Quality Factor Q", value: R > 0 ? fmt(q) : "— (set R in Advanced Options)" },
    { label: "Bandwidth (f₀/Q)", value: q > 0 ? freqStr(bandwidth) : "—" },
  ];
  const summaryStats = [
    { label: "Resonant Frequency", value: freqStr(f0) },
    { label: "Angular Frequency", value: `${fmt(omega / 1e6, 3)} Mrad/s` },
    { label: "Period", value: `${fmt(period * 1e9, 2)} ns` },
    { label: "Characteristic Impedance", value: `${fmt(impedance, 1)} Ω` },
    { label: "Quality Factor", value: q > 0 ? fmt(q) : "—" },
    { label: "Bandwidth", value: q > 0 ? freqStr(bandwidth) : "—" },
    { label: "Inductance", value: `${fmt(L * 1e6, 2)} µH` },
    { label: "Capacitance", value: `${fmt(C * 1e12, 2)} pF` },
  ];
  return { inductance: L, capacitance: C, resistance: R, f0, omega, period, impedance, q, bandwidth, curve, breakdown, summaryStats };
}

const DEFAULTS = { L: "10", C: "100", R: "0" };

export default function LcResonanceCalculator() {
  const [L, setL] = useState(DEFAULTS.L);
  const [C, setC] = useState(DEFAULTS.C);
  const [R, setR] = useState(DEFAULTS.R);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<LcResult | null>(null);

  const l = parseFloat(L) || 0;
  const c = parseFloat(C) || 0;
  const r = parseFloat(R) || 0;
  const errs: string[] = [];
  if (l <= 0 || c <= 0) errs.push("Inductance and capacitance must both be greater than 0.");
  if (r < 0) errs.push("Resistance cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLc(l * 1e-6, c * 1e-12, r)); };
  const reset = () => {
    setL(DEFAULTS.L); setC(DEFAULTS.C); setR(DEFAULTS.R); setShowAdv(false);
    setResult(calcLc(10e-6, 100e-12, 0));
  };
  useEffect(() => { setResult(calcLc(10e-6, 100e-12, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is LC resonance?", answer: "An inductor and capacitor in parallel or series resonate at the frequency where their reactances cancel: f₀ = 1/(2π√(LC)). At that frequency the circuit's impedance peaks (parallel) or dips (series), which is how radios tune to a station." },
    { question: "What is the quality factor Q?", answer: "Q measures how sharply the circuit resonates — the ratio of the characteristic impedance √(L/C) to the series resistance. Higher Q means a narrower bandwidth and better frequency selectivity, at the cost of ringing and losses." },
    { question: "What units should I use for L and C?", answer: "Enter inductance in microhenries (µH) and capacitance in picofarads (pF) — the common component values. A 10 µH inductor with 100 pF capacitor resonates near 5.03 MHz, in the shortwave band." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "LC Resonance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">LC Resonance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Inductance L (µH)</label>
                <div className={inp}><input type="number" value={L} onChange={e => setL(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">µH</span></div>
              </div>
              <div>
                <label className={lbl}>Capacitance C (pF)</label>
                <div className={inp}><input type="number" value={C} onChange={e => setC(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">pF</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Losses & Selectivity</div>
                  <div>
                    <label className={lbl}>Series Resistance R (Ω)</label>
                    <div className={inp}><input type="number" value={R} onChange={e => setR(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">Ω</span></div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Resonant Frequency</div>
                <div className="text-4xl font-extrabold tracking-tight">{freqStr(result.f0)}</div>
                <div className="text-sm text-muted-foreground mt-1">f₀ = 1/(2π√(LC)) with {fmt(result.inductance * 1e6, 2)} µH and {fmt(result.capacitance * 1e12, 2)} pF</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Period`, `${fmt(result.period * 1e9, 2)} ns`], ["Characteristic Z", `${fmt(result.impedance, 1)} Ω`], ["Quality Factor", result.q > 0 ? fmt(result.q) : "—"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Circuit Parameters</h3>
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
                <h3 className="text-base font-bold mb-4">Inductive vs Capacitive Reactance</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="freq" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" scale="log" domain={["auto", "auto"]} tickFormatter={(v: number) => freqStr(v)} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, n: string) => [fmt(v, 1), n === "xl" ? "X_L (Ω)" : "X_C (Ω)"]} labelFormatter={(v) => `f = ${freqStr(v as number)}`} />
                    <Legend />
                    <ReferenceLine x={result.f0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "f₀", position: "top", fontSize: 11, fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="xl" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="xc" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">X_L rises and X_C falls — they cancel exactly at f₀</p>
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
            <h2 className="text-2xl font-bold mb-3">Resonance in an LC Circuit</h2>
            <p>An inductor's reactance X_L = 2πfL grows with frequency, while a capacitor's reactance X_C = 1/(2πfC) shrinks. At the resonant frequency f₀ = 1/(2π√(LC)) the two cancel, and the circuit exchanges energy between the magnetic field of the coil and the electric field of the capacitor.</p>
            <h2 className="text-2xl font-bold mb-3">Quality Factor and Bandwidth</h2>
            <p>With a series resistance R, the circuit's Q equals √(L/C) divided by R. Higher Q sharpens the response — bandwidth is f₀/Q — which is exactly how a tuner rejects adjacent stations. Low-loss components and minimal resistance keep Q high.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Use</h2>
            <p>LC tanks appear in oscillators, filters, impedance matching, and wireless charging. Enter real component values — microhenry coils and picofarad capacitors — and the calculator reports the exact frequency the circuit will resonate at.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lc-resonance-calculator" />
          <PopularCalculators exclude="/calculator/lc-resonance-calculator" />
        </div>
      </div>
    </>
  );
}
