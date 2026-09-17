"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DividerInput {
  vin: number;
  r1: number;
  r2: number;
}

interface DividerResult {
  vout: number;
  current: number;
  rTotal: number;
  ratio: number;
  attenuationDb: number;
  vR1: number;
  chartData: { name: string; voltage: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDivider(input: DividerInput): DividerResult {
  const { vin, r1, r2 } = input;
  const rTotal = r1 + r2;
  const ratio = r2 / rTotal;
  const vout = vin * ratio;
  const current = vin / rTotal;
  const vR1 = vin - vout;
  const attenuationDb = r1 > 0 ? 20 * Math.log10(ratio) : -Infinity;

  const chartData = [
    { name: "Across R1", voltage: vR1, fill: "#a3a3a3" },
    { name: "Vout (across R2)", voltage: vout, fill: "hsl(var(--primary))" },
  ];

  const breakdown = [
    { label: "Input Voltage (Vin)", value: `${vin.toFixed(2)} V` },
    { label: "Resistor R1", value: `${r1.toLocaleString()} Ω` },
    { label: "Resistor R2", value: `${r2.toLocaleString()} Ω` },
    { label: "Total Resistance", value: `${rTotal.toLocaleString()} Ω` },
    { label: "Divider Ratio (R2 ÷ (R1+R2))", value: ratio.toFixed(4) },
    { label: "Voltage Across R1", value: `${vR1.toFixed(2)} V` },
    { label: "Output Voltage (Vout)", value: `${vout.toFixed(2)} V` },
    { label: "Circuit Current", value: `${current.toFixed(6)} A` },
    { label: "Attenuation", value: `${attenuationDb.toFixed(1)} dB` },
  ];

  const summaryStats = [
    { label: "Vout", value: `${vout.toFixed(2)} V` },
    { label: "Ratio", value: ratio.toFixed(4) },
    { label: "Current", value: `${current.toFixed(6)} A` },
    { label: "Voltage Across R1", value: `${vR1.toFixed(2)} V` },
    { label: "Attenuation", value: `${attenuationDb.toFixed(1)} dB` },
    { label: "Formula", value: "Vout = Vin × R2/(R1+R2)" },
  ];

  return { vout, current, rTotal, ratio, attenuationDb, vR1, chartData, breakdown, summaryStats };
}

const DEFAULTS: DividerInput = { vin: 12, r1: 10000, r2: 5000 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function VoltageDividerCalculator() {
  const [vin, setVin] = useState(String(DEFAULTS.vin));
  const [r1, setR1] = useState(String(DEFAULTS.r1));
  const [r2, setR2] = useState(String(DEFAULTS.r2));
  const [result, setResult] = useState<DividerResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcDivider({
        vin: parse(vin, DEFAULTS.vin),
        r1: Math.max(0.001, parse(r1, DEFAULTS.r1, 0.001)),
        r2: Math.max(0.001, parse(r2, DEFAULTS.r2, 0.001)),
      })
    );
  const reset = () => {
    setVin(String(DEFAULTS.vin));
    setR1(String(DEFAULTS.r1));
    setR2(String(DEFAULTS.r2));
    setResult(calcDivider(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcDivider(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a voltage divider?", answer: "A voltage divider is two resistors in series that split an input voltage into a smaller one: Vout = Vin × R2/(R1+R2). The output is the input scaled by the ratio of the lower resistor to the total. It is the most common circuit in electronics." },
    { question: "Why does the output depend only on the ratio?", answer: "The same current flows through both resistors, and Ohm's law makes each voltage drop proportional to its resistance. Vout is the fraction of total resistance occupied by R2 — so doubling both resistors leaves Vout unchanged but halves the current draw." },
    { question: "When should I use a voltage divider?", answer: "Use it for level shifting, sensor scaling, and setting reference voltages where the load draws negligible current. It is not a good voltage regulator — connecting a real load changes the effective ratio and pulls Vout down." },
    { question: "How do I choose the resistor values?", answer: "The ratio sets the output, and the absolute values set the current. Rule of thumb: keep the load at least 10× larger than R2, and pick values that waste acceptable current — 1 kΩ to 100 kΩ is the common range for signals." },
    { question: "What is the attenuation in dB?", answer: "For audio and signal work the ratio is often expressed in decibels: 20·log10(R2/(R1+R2)). A 50% divider is −6.02 dB, and a 10% divider is −20 dB — each −6 dB halves the voltage." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Voltage Divider Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Voltage Divider Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Input Voltage (Vin)</label>
                <div className={inp}><input type="number" value={vin} onChange={(e) => setVin(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">R1 (Ω)</label>
                <div className={inp}><input type="number" value={r1} onChange={(e) => setR1(e.target.value)} className={ci} min={1} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">R2 (Ω)</label>
              <div className={inp}><input type="number" value={r2} onChange={(e) => setR2(e.target.value)} className={ci} min={1} /></div>
              <p className="text-xs text-muted-foreground mt-1">Vout is taken across R2.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Output Voltage (Vout)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.vout.toFixed(2)} <span className="text-2xl text-muted-foreground">V</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Ratio {result.ratio.toFixed(4)} · {result.attenuationDb.toFixed(1)} dB attenuation</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Vout", `${result.vout.toFixed(2)} V`], ["Ratio", result.ratio.toFixed(4)], ["Current", `${result.current.toFixed(6)} A`]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Voltage Across Each Resistor</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2) + " V", "Voltage"]} />
                      <Bar dataKey="voltage" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">The two drops sum to exactly Vin — that is Kirchhoff's voltage law.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Voltage Divider Rule</h2>
            <p>Two resistors in series share the input voltage in proportion to their resistances. The output taken across R2 is <strong>Vout = Vin × R2 / (R1 + R2)</strong>. Because only the ratio matters, the divider is the standard way to scale a voltage down — the heart of sensor interfaces, level shifters, and reference circuits.</p>
            <h2 className="text-2xl font-bold mb-3">Designing a Divider</h2>
            <p>First choose the ratio you need: for a 3.3 V output from a 5 V supply, R2/(R1+R2) = 0.66, so R1 should be about half of R2. Then scale both values to control the current: larger resistors waste less power but make the divider sensitive to a load connected at Vout.</p>
            <h2 className="text-2xl font-bold mb-3">The Load Problem</h2>
            <p>A real load in parallel with R2 reduces the effective lower resistance and drags Vout down. As a rule, keep the load at least ten times R2 so the error stays under 10% — or buffer the output with an op-amp, which is what professional circuits do when accuracy matters.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/voltage-divider-calculator" />
          <PopularCalculators exclude="/calculator/voltage-divider-calculator" />
        </div>
      </div>
    </>
  );
}
