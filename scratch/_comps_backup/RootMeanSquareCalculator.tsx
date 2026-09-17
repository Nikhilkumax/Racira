"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface RmsResult {
  rms: number;
  sumSquares: number;
  meanSquare: number;
  count: number;
  chartData: { name: string; square: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRms(values: number[]): RmsResult {
  const count = values.length;
  const sumSquares = values.reduce((acc, v) => acc + v * v, 0);
  const meanSquare = sumSquares / count;
  const rms = Math.sqrt(meanSquare);

  const chartData = values.map((v, i) => ({
    name: `x${i + 1}`,
    square: v * v,
    fill: i === 0 ? "hsl(var(--primary))" : "#a3a3a3",
  }));

  const breakdown = [
    ...values.map((v, i) => ({ label: `Value x${i + 1}`, value: v.toFixed(2) })),
    ...values.map((v, i) => ({ label: `x${i + 1}²`, value: (v * v).toFixed(2) })),
    { label: "Number of Values (n)", value: `${count}` },
    { label: "Sum of Squares (Σx²)", value: sumSquares.toFixed(2) },
    { label: "Mean Square (Σx² ÷ n)", value: meanSquare.toFixed(2) },
    { label: "Root Mean Square", value: rms.toFixed(2) },
  ];

  const summaryStats = [
    { label: "Root Mean Square", value: rms.toFixed(2) },
    { label: "Mean Square", value: meanSquare.toFixed(2) },
    { label: "Sum of Squares", value: sumSquares.toFixed(2) },
    { label: "Number of Values", value: `${count}` },
    { label: "Formula", value: "√(Σx² ÷ n)" },
    { label: "Simple Mean", value: (values.reduce((a, b) => a + b, 0) / count).toFixed(2) },
  ];

  return { rms, sumSquares, meanSquare, count, chartData, breakdown, summaryStats };
}

const DEFAULT_VALUES = [3, 4, 5, 6];

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RootMeanSquareCalculator() {
  const [values, setValues] = useState(DEFAULT_VALUES.map(String));
  const [result, setResult] = useState<RmsResult | null>(null);

  const calculate = () =>
    setResult(
      calcRms(
        values.map((s, i) => {
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : DEFAULT_VALUES[i];
        })
      )
    );
  const reset = () => {
    setValues(DEFAULT_VALUES.map(String));
    setResult(calcRms(DEFAULT_VALUES));
  };
  useEffect(() => {
    setResult(calcRms(DEFAULT_VALUES));
  }, []);

  const faqs = [
    { question: "What is root mean square (RMS)?", answer: "RMS is the square root of the mean of the squared values: √(Σx² ÷ n). Squaring removes negative signs, so RMS measures the typical magnitude of a signal regardless of direction — it is the standard measure of amplitude for AC electricity, audio, and vibration." },
    { question: "How is RMS different from the simple mean?", answer: "The simple mean can be near zero when positive and negative values cancel (like a sine wave averaging to 0). RMS squares each value first, so it always reflects the true magnitude. For household AC, 120 V RMS delivers the same power as 120 V DC even though the voltage peaks near 170 V." },
    { question: "When is RMS used in the real world?", answer: "AC voltage and current ratings (120 V household mains are RMS), audio loudness and speaker power, signal processing, statistics (standard deviation is an RMS of deviations from the mean), and error measurement (RMSE — root mean square error)." },
    { question: "What is the relationship between RMS and standard deviation?", answer: "The standard deviation is the RMS of the deviations from the mean. If the values already have a mean of zero, RMS and standard deviation are identical. In general, RMS² = mean² + variance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Root Mean Square Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Root Mean Square Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            {[0, 1].map((row) => (
              <div key={row} className="grid grid-cols-2 gap-3">
                {[0, 1].map((col) => {
                  const i = row * 2 + col;
                  return (
                    <div key={col}>
                      <label className="text-sm font-medium mb-1 block">Value x{i + 1}</label>
                      <div className={inp}><input type="number" value={values[i]} onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? e.target.value : x)))} className={ci} /></div>
                    </div>
                  );
                })}
              </div>
            ))}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Root Mean Square (RMS)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.rms.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">√(Σx² ÷ n) with n = {result.count}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["RMS", result.rms.toFixed(2)], ["Mean Square", result.meanSquare.toFixed(2)], ["Σ x²", result.sumSquares.toFixed(1)]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === values.length * 2 + 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Squared Values</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "x²"]} />
                      <ReferenceLine y={result.meanSquare} stroke="hsl(var(--primary))" strokeDasharray="4 4" label={{ value: "Mean square", position: "insideTopRight", fontSize: 11, fill: "hsl(var(--primary))" }} />
                      <Bar dataKey="square" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">What Is Root Mean Square?</h2>
            <p>Root mean square (RMS) is the square root of the mean of the squared values of a set. Squaring every value makes negatives positive, so the RMS captures typical magnitude rather than net direction. It is the standard measure of amplitude for alternating current, audio signals, and vibration.</p>
            <h2 className="text-2xl font-bold mb-3">How to Calculate RMS</h2>
            <p><strong>RMS = √(Σxᵢ² ÷ n)</strong> — square each value, add them, divide by the count, then take the square root. When the values represent a continuous signal like a sine wave, the same idea becomes an integral, but for a finite list of measurements this formula is exact.</p>
            <h2 className="text-2xl font-bold mb-3">Why Household Voltage Is Stated as RMS</h2>
            <p>Mains electricity alternates between about +170 V and −170 V, averaging to zero. Saying "120 volts" would be meaningless for the average — yet 120 V RMS is exactly right, because a heater connected to that AC runs at the same power as one connected to 120 V DC. The RMS value is the DC equivalent that produces the same heating effect.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/root-mean-square-calculator" />
          <PopularCalculators exclude="/calculator/root-mean-square-calculator" />
        </div>
      </div>
    </>
  );
}
