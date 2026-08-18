"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ParallelResult {
  totalR: number;
  conductance: number;
  chartData: { name: string; conductance: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcParallel(resistors: number[], voltage: number | null): ParallelResult {
  const conductance = resistors.reduce((acc, r) => (r > 0 ? acc + 1 / r : acc), 0);
  const totalR = conductance > 0 ? 1 / conductance : 0;
  const valid = resistors.filter((r) => r > 0);

  const colors = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6"];
  const chartData = resistors.map((r, i) => ({
    name: `R${i + 1}`,
    conductance: r > 0 ? 1 / r : 0,
    fill: colors[i % colors.length],
  }));

  const breakdown = [
    ...resistors.map((r, i) => ({
      label: `R${i + 1}`,
      value: r > 0 ? `${r.toLocaleString()} Ω` : "—",
    })),
    { label: "Sum of Conductances (Σ 1/R)", value: `${conductance.toFixed(6)} S` },
    { label: "Total Resistance (1/Σ(1/R))", value: `${totalR.toLocaleString(undefined, { maximumFractionDigits: 3 })} Ω` },
    ...(voltage !== null && voltage > 0 && totalR > 0
      ? [
          { label: "Applied Voltage", value: `${voltage} V` },
          { label: "Total Current (V ÷ Rt)", value: `${(voltage / totalR).toFixed(3)} A` },
        ]
      : []),
    ...(valid.length === 2 && valid[0] === valid[1]
      ? [{ label: "Two equal resistors", value: `Rt = R/2 = ${(valid[0] / 2).toLocaleString()} Ω` }]
      : []),
  ];

  const summaryStats = [
    { label: "Total Resistance", value: `${totalR.toLocaleString(undefined, { maximumFractionDigits: 3 })} Ω` },
    { label: "Total Conductance", value: `${conductance.toFixed(6)} S` },
    { label: "Resistors", value: `${resistors.filter((r) => r > 0).length}` },
    { label: "Always Less Than", value: `${Math.min(...valid)} Ω (smallest resistor)` },
    ...(voltage !== null && voltage > 0 && totalR > 0
      ? [{ label: "Total Current", value: `${(voltage / totalR).toFixed(3)} A` }]
      : []),
    { label: "Formula", value: "1/Rt = Σ(1/Rᵢ)" },
  ];

  return { totalR, conductance, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ResistorsInParallelCalculator() {
  const [r1, setR1] = useState("1000");
  const [r2, setR2] = useState("2000");
  const [r3, setR3] = useState("3000");
  const [r4, setR4] = useState("4000");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [voltage, setVoltage] = useState("12");
  const [useVoltage, setUseVoltage] = useState(false);
  const [result, setResult] = useState<ParallelResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () => {
    const resistors = [parse(r1, 1000), parse(r2, 2000), parse(r3, 3000), parse(r4, 4000)];
    setResult(calcParallel(resistors, useVoltage ? Math.max(0, parseFloat(voltage) || 0) : null));
  };
  const reset = () => {
    setR1("1000");
    setR2("2000");
    setR3("3000");
    setR4("4000");
    setUseVoltage(false);
    setVoltage("12");
    setResult(calcParallel([1000, 2000, 3000, 4000], null));
  };
  useEffect(() => {
    setResult(calcParallel([1000, 2000, 3000, 4000], null));
  }, []);

  const faqs = [
    { question: "How do parallel resistors combine?", answer: "The total resistance of parallel resistors is found by adding their conductances (1/R): 1/Rt = 1/R1 + 1/R2 + ... The result is always smaller than the smallest individual resistor — every extra path gives current more room to flow." },
    { question: "Why is the total less than the smallest resistor?", answer: "Each parallel branch is an independent path for current. Adding a branch can only reduce the total opposition, just as adding lanes to a highway only increases traffic flow. The more paths, the lower the combined resistance." },
    { question: "What about two equal resistors?", answer: "Two equal resistors R in parallel give exactly R/2 — a handy shortcut for speaker wiring and LED circuits. Three equal resistors give R/3, and so on: n equal resistors in parallel give R/n." },
    { question: "How do I compute the current in each branch?", answer: "Each resistor sees the full supply voltage, so its branch current is V/Rᵢ (Ohm's law). The total current is the sum of the branch currents — which is exactly equivalent to V divided by the combined resistance." },
    { question: "What are real-world uses?", answer: "Parallel wiring is how household outlets, LED strips, and speakers are connected. Resistors in parallel also allow building odd values from standard ones — two 100 kΩ resistors in parallel make exactly 50 kΩ." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Resistors in Parallel Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Resistors in Parallel Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            {[0, 1].map((row) => (
              <div key={row} className="grid grid-cols-2 gap-3">
                {[0, 1].map((col) => {
                  const i = row * 2;
                  const val = [r1, r2, r3, r4][i + col];
                  const set = [setR1, setR2, setR3, setR4][i + col];
                  return (
                    <div key={col}>
                      <label className="text-sm font-medium mb-1 block">Resistor R{i + col + 1} (Ω)</label>
                      <div className={inp}><input type="number" value={val} onChange={(e) => set(e.target.value)} className={ci} min={1} /></div>
                    </div>
                  );
                })}
              </div>
            ))}

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-sm text-primary font-medium text-left self-start"
            >
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={useVoltage} onChange={(e) => setUseVoltage(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                  Calculate branch currents with a supply voltage
                </label>
                {useVoltage && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Supply Voltage (V)</label>
                    <div className={inp}><input type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} className={ci} min={0} /></div>
                  </div>
                )}
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Resistance (Rt)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.totalR.toLocaleString(undefined, { maximumFractionDigits: 3 })} <span className="text-2xl text-muted-foreground">Ω</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Conductance: {result.conductance.toFixed(6)} S · less than the smallest {Math.min(...result.chartData.filter((d) => d.conductance > 0).map((d) => 1 / d.conductance)).toLocaleString()} Ω</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Total R", `${result.totalR.toLocaleString(undefined, { maximumFractionDigits: 1 })} Ω`], ["Conductance", `${result.conductance.toFixed(4)} S`], ["Branches", `${result.chartData.filter((d) => d.conductance > 0).length}`]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Conductance per Branch (1/R)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(6), "Conductance (S)"]} />
                      <Bar dataKey="conductance" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Conductance is the inverse of resistance — the bars sum to the total conductance, whose inverse is Rt.</p>
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
            <h2 className="text-2xl font-bold mb-3">Parallel Resistance, Explained</h2>
            <p>When resistors are wired side by side, current can flow through each branch independently. The combined resistance follows the reciprocal rule: <strong>1/Rt = 1/R1 + 1/R2 + 1/R3 + …</strong>. Each term 1/R is the conductance — how easily a branch lets current through — and the total conductance is simply their sum.</p>
            <h2 className="text-2xl font-bold mb-3">The Result Is Always Smaller</h2>
            <p>Because every added branch provides a new path for current, the total resistance of parallel resistors is always less than the smallest individual resistor. Two 100 Ω resistors in parallel make 50 Ω; four 100 Ω resistors make 25 Ω. This is why connecting speakers in parallel lowers the load impedance an amplifier sees.</p>
            <h2 className="text-2xl font-bold mb-3">Branch Currents</h2>
            <p>In a parallel circuit every resistor sees the full supply voltage, so each branch draws V/Rᵢ amps. The total current is the sum of the branch currents — the practical form of Ohm's law for parallel networks, and the reason fuses protect each circuit independently in household wiring.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/resistors-in-parallel-calculator" />
          <PopularCalculators exclude="/calculator/resistors-in-parallel-calculator" />
        </div>
      </div>
    </>
  );
}
