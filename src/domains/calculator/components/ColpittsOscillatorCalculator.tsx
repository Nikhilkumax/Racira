"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Waves, Zap, CircuitBoard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface ColpittsResult {
  frequency: number;
  c1: number;
  c2: number;
  l: number;
  ratio: number;
  impedance: number;
  qFactor: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  c1: "10",
  c2: "10",
  l: "1",
  c1Unit: "nF",
  c2Unit: "nF",
  lUnit: "µH",
};

const UNIT_FACTORS: Record<string, number> = {
  pF: 1e-12,
  nF: 1e-9,
  µF: 1e-6,
  mF: 1e-3,
  pH: 1e-12,
  nH: 1e-9,
  µH: 1e-6,
  mH: 1e-3,
};

const calculate = (v: typeof DEFAULTS): ColpittsResult => {
  const c1Val = parseFloat(v.c1) || 0;
  const c2Val = parseFloat(v.c2) || 0;
  const lVal = parseFloat(v.l) || 0;

  const c1 = c1Val * (UNIT_FACTORS[v.c1Unit] || 1e-9);
  const c2 = c2Val * (UNIT_FACTORS[v.c2Unit] || 1e-9);
  const l = lVal * (UNIT_FACTORS[v.lUnit] || 1e-6);

  const cTotal = (c1 * c2) / (c1 + c2);
  const frequency = l > 0 && cTotal > 0 ? 1 / (2 * Math.PI * Math.sqrt(l * cTotal)) : 0;
  const ratio = c1 > 0 ? c2 / c1 : 0;
  const impedance = frequency > 0 ? 1 / (2 * Math.PI * frequency * cTotal) : 0;
  const qFactor = frequency > 0 ? Math.sqrt(c1 / c2) * Math.sqrt(l / cTotal) / (1 + c2 / c1) : 0;

  const chartData = [
    { name: "C1", value: parseFloat(c1Val.toFixed(2)), fill: "#3b82f6" },
    { name: "C2", value: parseFloat(c2Val.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "L", value: parseFloat(lVal.toFixed(2)), fill: "#10b981" },
    { name: "Freq (MHz)", value: parseFloat((frequency / 1e6).toFixed(2)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "C1", value: `${c1Val} ${v.c1Unit} (${c1.toExponential(3)} F)` },
    { label: "C2", value: `${c2Val} ${v.c2Unit} (${c2.toExponential(3)} F)` },
    { label: "L", value: `${lVal} ${v.lUnit} (${l.toExponential(3)} H)` },
    { label: "C1:C2 Ratio", value: `${ratio.toFixed(3)}` },
    { label: "Total Capacitance (C1‖C2)", value: `${cTotal.toExponential(3)} F` },
    { label: "Oscillation Frequency", value: `${frequency.toFixed(2)} Hz` },
    { label: "Frequency (MHz)", value: `${(frequency / 1e6).toFixed(4)} MHz` },
    { label: "Frequency (GHz)", value: `${(frequency / 1e9).toFixed(6)} GHz` },
    { label: "Impedance at Resonance", value: `${impedance.toFixed(2)} Ω` },
    { label: "Q Factor", value: `${qFactor.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Frequency", value: `${(frequency / 1e6).toFixed(4)} MHz` },
    { label: "C1:C2 Ratio", value: `${ratio.toFixed(3)}` },
    { label: "Q Factor", value: `${qFactor.toFixed(2)}` },
    { label: "Total Capacitance", value: `${cTotal.toExponential(3)} F` },
    { label: "Impedance", value: `${impedance.toFixed(2)} Ω` },
  ];

  return {
    frequency, c1, c2, l, ratio, impedance, qFactor,
    chartData, breakdown, summaryStats,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function ColpittsOscillatorCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ColpittsResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is a Colpitts oscillator?", answer: "A Colpitts oscillator is an electronic oscillator circuit that uses an LC (inductor-capacitor) tank circuit to generate sinusoidal oscillations. It was invented by Edwin Colpitts in 1918. The distinguishing feature is that the feedback voltage is taken from a voltage divider made of two capacitors in series." },
    { question: "How is the oscillation frequency calculated?", answer: "The oscillation frequency of a Colpitts oscillator is determined by the inductance L and the total capacitance of the two series capacitors C1 and C2. The formula is f = 1/(2π√(L·C_total)), where C_total = (C1·C2)/(C1+C2). This is the same as the resonant frequency of the LC tank circuit." },
    { question: "What is the role of the C1:C2 ratio?", answer: "The C1:C2 ratio determines the feedback fraction and the impedance matching. A higher ratio (C1 >> C2) provides more feedback but lower output impedance. A lower ratio (C2 >> C1) provides less feedback but higher output impedance. The ratio also affects the Q factor of the oscillator." },
    { question: "What is the Q factor of a Colpitts oscillator?", answer: "The Q factor (quality factor) measures how underdamped the oscillator is. A higher Q factor means lower energy loss relative to the stored energy, resulting in a more stable and pure sinusoidal output. The Q factor depends on the component values and the inductor's parasitic resistance." },
    { question: "What are typical applications of Colpitts oscillators?", answer: "Colpitts oscillators are widely used in RF signal generation, frequency synthesizers, radio transmitters, and test equipment. They are particularly suited for generating signals in the MHz to GHz range due to their ability to use small inductance and capacitance values." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Colpitts Oscillator Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Colpitts Oscillator Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <CircuitBoard className="w-3.5 h-3.5" /> Tank Circuit
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">C1 (Capacitor 1)</label>
                  <div className="flex gap-2">
                    <input type="number" value={vals.c1} onChange={(e) => updateVal("c1", e.target.value)} className="input-calc flex-1" step="any" min="0" />
                    <select value={vals.c1Unit} onChange={(e) => updateVal("c1Unit", e.target.value)} className="input-calc w-20">
                      <option value="pF">pF</option>
                      <option value="nF">nF</option>
                      <option value="µF">µF</option>
                      <option value="mF">mF</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">C2 (Capacitor 2)</label>
                  <div className="flex gap-2">
                    <input type="number" value={vals.c2} onChange={(e) => updateVal("c2", e.target.value)} className="input-calc flex-1" step="any" min="0" />
                    <select value={vals.c2Unit} onChange={(e) => updateVal("c2Unit", e.target.value)} className="input-calc w-20">
                      <option value="pF">pF</option>
                      <option value="nF">nF</option>
                      <option value="µF">µF</option>
                      <option value="mF">mF</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">L (Inductance)</label>
                  <div className="flex gap-2">
                    <input type="number" value={vals.l} onChange={(e) => updateVal("l", e.target.value)} className="input-calc flex-1" step="any" min="0" />
                    <select value={vals.lUnit} onChange={(e) => updateVal("lUnit", e.target.value)} className="input-calc w-20">
                      <option value="pH">pH</option>
                      <option value="nH">nH</option>
                      <option value="µH">µH</option>
                      <option value="mH">mH</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Waves className="h-3 w-3" /> Oscillation Frequency
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{(result.frequency / 1e6).toFixed(4)} MHz</div>
                <p className="text-sm text-muted-foreground">
                  C1:C2 = {result.ratio.toFixed(3)} · Q = {result.qFactor.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Frequency</div>
                  <div className="text-lg font-bold text-foreground">{(result.frequency / 1e6).toFixed(4)} MHz</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Q Factor</div>
                  <div className="text-lg font-bold text-foreground">{result.qFactor.toFixed(2)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Impedance</div>
                  <div className="text-lg font-bold text-foreground">{result.impedance.toFixed(1)} Ω</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Parameter</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Component Values & Frequency</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={result.chartData[i].fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Colpitts Oscillator: RF Signal Generation</h2>
            <p>The Colpitts oscillator is one of the most widely used LC oscillator topologies for generating sinusoidal signals at radio frequencies. Its simplicity, stability, and ease of tuning make it a popular choice for RF signal generators, local oscillators in receivers, and frequency reference circuits. Understanding how to calculate the oscillation frequency and component values is essential for RF circuit design.</p>

            <h3>1. How the Colpitts Oscillator Works</h3>
            <p>The Colpitts oscillator uses an LC tank circuit (an inductor L in parallel with two capacitors C1 and C2 in series) to set the oscillation frequency. The transistor or active device provides gain, and the capacitive voltage divider (C1:C2) provides positive feedback. When the loop gain exceeds unity and the phase shift is zero, the circuit oscillates at the resonant frequency of the tank.</p>

            <h3>2. Frequency Calculation</h3>
            <p>The oscillation frequency is determined by the formula f = 1/(2π√(L·C_eq)), where C_eq = (C1·C2)/(C1+C2) is the equivalent capacitance of the two series capacitors. This formula assumes ideal components with no parasitic resistance. In practice, the actual frequency may be slightly lower due to parasitic capacitances and the transistor's junction capacitances.</p>

            <h3>3. Design Considerations</h3>
            <p>When designing a Colpitts oscillator, consider: (1) The C1:C2 ratio affects the feedback level and output impedance — typically C1 &gt; C2 for adequate feedback; (2) The Q factor of the inductor affects frequency stability and phase noise; (3) Parasitic capacitances can shift the frequency, especially at higher frequencies; (4) The operating frequency range is typically from a few MHz to several GHz depending on the component values chosen.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/colpitts-oscillator-calculator" />
          <PopularCalculators exclude="/calculator/colpitts-oscillator-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#f59e0b"];