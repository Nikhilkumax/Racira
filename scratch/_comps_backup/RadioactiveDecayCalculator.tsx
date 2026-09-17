"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface DecayResult {
  remaining: number;
  decayed: number;
  lambda: number;
  pctRemaining: number;
  halfLives: number;
  chartData: { hl: number; remaining: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDecay(n0: number, halfLife: number, elapsed: number): DecayResult {
  const lambda = Math.LN2 / halfLife;
  const remaining = n0 * Math.exp(-lambda * elapsed);
  const decayed = n0 - remaining;
  const pctRemaining = n0 > 0 ? (remaining / n0) * 100 : 0;
  const halfLives = elapsed / halfLife;

  const chartData = [0, 1, 2, 3, 4, 5].map((hl) => ({
    hl,
    remaining: n0 * Math.pow(0.5, hl),
  }));

  const breakdown = [
    { label: "Initial Amount (N₀)", value: `${n0.toLocaleString()} ${n0 >= 100 ? "g" : "units"}` },
    { label: "Half-Life (T½)", value: `${halfLife.toLocaleString()} time units` },
    { label: "Elapsed Time (t)", value: `${elapsed.toLocaleString()} time units` },
    { label: "Elapsed Half-Lives", value: `${halfLives.toFixed(2)}` },
    { label: "Decay Constant (λ = ln2 ÷ T½)", value: `${lambda.toExponential(4)} per unit time` },
    { label: "Remaining (N = N₀·e^(−λt))", value: `${remaining.toLocaleString(undefined, { maximumFractionDigits: 3 })} (${pctRemaining.toFixed(1)}%)` },
    { label: "Decayed Amount", value: `${decayed.toLocaleString(undefined, { maximumFractionDigits: 3 })}` },
  ];

  const summaryStats = [
    { label: "Remaining", value: `${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "% Remaining", value: `${pctRemaining.toFixed(1)}%` },
    { label: "Decayed", value: `${decayed.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Half-Lives Elapsed", value: `${halfLives.toFixed(2)}` },
    { label: "Decay Constant", value: `${lambda.toExponential(3)}` },
    { label: "Formula", value: "N = N₀·e^(−λt)" },
  ];

  return { remaining, decayed, lambda, pctRemaining, halfLives, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RadioactiveDecayCalculator() {
  const [n0, setN0] = useState("100");
  const [halfLife, setHalfLife] = useState("8");
  const [elapsed, setElapsed] = useState("24");
  const [result, setResult] = useState<DecayResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcDecay(
        parse(n0, 100),
        Math.max(1e-9, parse(halfLife, 8, 1e-9)),
        parse(elapsed, 24)
      )
    );
  const reset = () => {
    setN0("100");
    setHalfLife("8");
    setElapsed("24");
    setResult(calcDecay(100, 8, 24));
  };
  useEffect(() => {
    setResult(calcDecay(100, 8, 24));
  }, []);

  const faqs = [
    { question: "What is radioactive decay?", answer: "Unstable atomic nuclei spontaneously transform into other nuclei, emitting radiation. The process is exponential: a fixed fraction of the remaining nuclei decays each unit of time, so the amount follows N = N₀·e^(−λt)." },
    { question: "What is a half-life?", answer: "The half-life is the time for half of a sample to decay — a fundamental property of each isotope. After one half-life 50% remains, after two 25%, after three 12.5%. After 10 half-lives, less than 0.1% remains." },
    { question: "What are typical half-lives?", answer: "Iodine-131: 8 days. Cobalt-60: 5.3 years. Carbon-14: 5,730 years. Plutonium-239: 24,100 years. Uranium-238: 4.5 billion years — short enough to power reactors, long enough to date the Earth." },
    { question: "How is carbon dating done?", answer: "Living organisms maintain a constant ¹⁴C/¹²C ratio. After death, ¹⁴C decays with its 5,730-year half-life, so measuring the remaining ratio reveals how long ago the organism died — accurate back to about 50,000 years." },
    { question: "What units should I use?", answer: "Any consistent units work: grams, becquerels, or atom counts for the amount, and days, years, or seconds for time — just keep half-life and elapsed time in the same units. The decay constant λ = ln 2 ÷ T½ is derived automatically." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Radioactive Decay Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Radioactive Decay Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Amount (N₀)</label>
                <div className={inp}><input type="number" value={n0} onChange={(e) => setN0(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Half-Life (T½)</label>
                <div className={inp}><input type="number" value={halfLife} onChange={(e) => setHalfLife(e.target.value)} className={ci} min={1e-9} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Elapsed Time (t)</label>
              <div className={inp}><input type="number" value={elapsed} onChange={(e) => setElapsed(e.target.value)} className={ci} min={0} /></div>
              <p className="text-xs text-muted-foreground mt-1">Use the same time units as the half-life.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Amount Remaining</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.pctRemaining.toFixed(1)}% of the original · {result.halfLives.toFixed(1)} half-lives elapsed</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Remaining", `${result.pctRemaining.toFixed(1)}%`], ["Decayed", `${result.decayed.toLocaleString(undefined, { maximumFractionDigits: 1 })}`], ["λ", result.lambda.toExponential(3)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Decay Curve</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hl" tick={{ fontSize: 11 }} label={{ value: "Half-lives elapsed", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(undefined, { maximumFractionDigits: 2 }), "Remaining"]} labelFormatter={(l) => `${l} half-life${l === 1 ? "" : "s"}`} />
                      <ReferenceLine y={parse(n0, 100) / 2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "50%", position: "insideTopRight", fontSize: 11, fill: "#b45309" }} />
                      <Line type="monotone" dataKey="remaining" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Each half-life halves the sample — the exponential curve N = N₀·2^(−t/T½).</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
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
            <h2 className="text-2xl font-bold mb-3">Exponential Decay</h2>
            <p>Radioactive decay is the archetype of exponential processes: every moment, a constant fraction of the remaining atoms transforms, so the quantity follows <strong>N(t) = N₀·e^(−λt)</strong> with λ = ln 2 / T½. It is memoryless — a sample of 1 g and a sample of 1 kg both decay halfway in exactly one half-life.</p>
            <h2 className="text-2xl font-bold mb-3">The Half-Life in Practice</h2>
            <p>Half-lives span 23 orders of magnitude — from polonium-214's 164 microseconds to uranium-238's 4.5 billion years. This range is what makes decay so versatile: iodine-131 (8 days) treats thyroid cancer then clears from the body, while carbon-14 (5,730 years) dates archaeology and potassium-40 (1.25 billion years) dates the Earth's rocks.</p>
            <h2 className="text-2xl font-bold mb-3">Decay Chains and Safety</h2>
            <p>Decay often continues through daughter products — uranium-238 passes through 14 steps before reaching stable lead. The 'ten half-life rule' is the practical safety guideline: after 10 half-lives less than 0.1% of an isotope remains, which is why medical isotopes are chosen with half-lives measured in hours to days.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/radioactive-decay-calculator" />
          <PopularCalculators exclude="/calculator/radioactive-decay-calculator" />
        </div>
      </div>
    </>
  );
}
