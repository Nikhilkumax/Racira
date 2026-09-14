"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SeriesResult {
  totalR: number;
  chartData: { name: string; resistance: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSeries(resistors: number[], current: number | null): SeriesResult {
  const totalR = resistors.reduce((a, b) => a + b, 0);
  const valid = resistors.filter((r) => r > 0);

  const colors = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6"];
  const chartData = resistors.map((r, i) => ({
    name: `R${i + 1}`,
    resistance: r,
    fill: colors[i % colors.length],
  }));

  const breakdown = [
    ...resistors.map((r, i) => ({ label: `R${i + 1}`, value: `${r.toLocaleString()} Ω` })),
    { label: "Total Resistance (ΣR)", value: `${totalR.toLocaleString()} Ω` },
    ...(current !== null && current > 0
      ? [
          { label: "Circuit Current", value: `${current.toLocaleString()} A` },
          { label: "Voltage Across R1", value: `${(current * resistors[0]).toFixed(2)} V` },
          { label: "Voltage Across R2", value: `${(current * resistors[1]).toFixed(2)} V` },
          { label: "Voltage Across R3", value: `${(current * resistors[2]).toFixed(2)} V` },
          { label: "Voltage Across R4", value: `${(current * resistors[3]).toFixed(2)} V` },
          { label: "Total Voltage (V = I·Rt)", value: `${(current * totalR).toFixed(2)} V` },
        ]
      : []),
  ];

  const summaryStats = [
    { label: "Total Resistance", value: `${totalR.toLocaleString()} Ω` },
    { label: "Resistors", value: `${valid.length}` },
    { label: "Always Greater Than", value: `${Math.max(...resistors).toLocaleString()} Ω (largest resistor)` },
    ...(current !== null && current > 0
      ? [{ label: "Total Voltage", value: `${(current * totalR).toFixed(2)} V` }]
      : []),
    { label: "Formula", value: "Rt = R1 + R2 + R3 + R4" },
    { label: "Current Paths", value: "Single (identical current)" },
  ];

  return { totalR, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ResistorsInSeriesCalculator() {
  const [r1, setR1] = useState("100");
  const [r2, setR2] = useState("200");
  const [r3, setR3] = useState("330");
  const [r4, setR4] = useState("470");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [current, setCurrent] = useState("0.05");
  const [useCurrent, setUseCurrent] = useState(false);
  const [result, setResult] = useState<SeriesResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () => {
    const resistors = [parse(r1, 100), parse(r2, 200), parse(r3, 330), parse(r4, 470)];
    setResult(calcSeries(resistors, useCurrent ? Math.max(0, parseFloat(current) || 0) : null));
  };
  const reset = () => {
    setR1("100");
    setR2("200");
    setR3("330");
    setR4("470");
    setUseCurrent(false);
    setCurrent("0.05");
    setResult(calcSeries([100, 200, 330, 470], null));
  };
  useEffect(() => {
    setResult(calcSeries([100, 200, 330, 470], null));
  }, []);

  const faqs = [
    { question: "How do series resistors combine?", answer: "Resistors in series simply add: Rt = R1 + R2 + R3 + … . The same current flows through each one, so the total opposition is the sum — always larger than the biggest single resistor." },
    { question: "What is the current in a series circuit?", answer: "Identical everywhere. The current flows through each resistor in turn, so every resistor carries the same current — which is why a burned-out bulb in a string of Christmas lights opens the whole circuit." },
    { question: "How do I find the voltage across each resistor?", answer: "Each resistor drops a voltage proportional to its resistance: VR = I × R (Ohm's law). The drops add up to the supply voltage — Kirchhoff's voltage law. The chart shows this split visually." },
    { question: "What are series resistors used for?", answer: "Current limiting for LEDs, voltage dividers, pull-up/pull-down networks, and creating exact values — stacking a 10 kΩ and a 2.2 kΩ resistor gives exactly 12.2 kΩ." },
    { question: "What happens if one resistor fails open?", answer: "The entire circuit stops conducting — series circuits have no redundancy. This is the key difference from parallel wiring, where a failed branch simply stops drawing current." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Resistors in Series Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Resistors in Series Calculator</h1>

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
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Circuit Analysis</div>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={useCurrent} onChange={(e) => setUseCurrent(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                  Show voltage drops with a circuit current
                </label>
                {useCurrent && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Circuit Current (A)</label>
                    <div className={inp}><input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} className={ci} min={0} /></div>
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
                  <div className="text-4xl font-extrabold tracking-tight">{result.totalR.toLocaleString()} <span className="text-2xl text-muted-foreground">Ω</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Sum of {result.chartData.length} resistors · always greater than the largest single one</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Total R", `${result.totalR.toLocaleString()} Ω`], ["Resistors", `${result.chartData.length}`], ["Largest", `${Math.max(...result.chartData.map((d) => d.resistance)).toLocaleString()} Ω`]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Resistance per Resistor</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString() + " Ω", "Resistance"]} />
                      <Bar dataKey="resistance" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">In series, the resistances add end-to-end — the bars sum to the total.</p>
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
            <h2 className="text-2xl font-bold mb-3">Series Resistance, Explained</h2>
            <p>Resistors wired end-to-end form a single path for current. Because the same current must push through each one, their resistances add directly: <strong>Rt = R1 + R2 + R3 + …</strong>. Series is the complement of parallel: where parallel divides, series accumulates.</p>
            <h2 className="text-2xl font-bold mb-3">Voltage Drops Add Up</h2>
            <p>Each series resistor drops a voltage proportional to its resistance — VR = I × R — and Kirchhoff's voltage law guarantees the drops sum to the supply. This voltage-splitting behavior is exactly what makes series networks the basis of voltage dividers and LED current limiters.</p>
            <h2 className="text-2xl font-bold mb-3">One Path, One Weakness</h2>
            <p>The single-path nature of series circuits is both their strength and their weakness: current is identical everywhere, which simplifies analysis, but a single open component stops the whole circuit. Household wiring uses parallel for exactly this reason — so one blown fuse doesn't darken the house.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/resistors-in-series-calculator" />
          <PopularCalculators exclude="/calculator/resistors-in-series-calculator" />
        </div>
      </div>
    </>
  );
}
