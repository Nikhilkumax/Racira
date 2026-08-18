"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SwolfInput {
  strokes: number;
  secondsPerLength: number;
  poolLength: number;
}

interface SwolfResult {
  swolf: number;
  level: string;
  levelColor: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSwolf(input: SwolfInput): SwolfResult {
  const swolf = input.strokes + input.secondsPerLength;
  let level: string;
  let levelColor: string;
  if (input.poolLength >= 50) {
    // 50 m pool: scores run ~25 higher
    level = swolf <= 65 ? "Elite" : swolf <= 75 ? "Good" : swolf <= 85 ? "Average" : "Needs Work";
    levelColor = swolf <= 65 ? "text-emerald-600" : swolf <= 75 ? "text-blue-500" : swolf <= 85 ? "text-amber-500" : "text-red-500";
  } else {
    level = swolf <= 42 ? "Elite" : swolf <= 50 ? "Good" : swolf <= 60 ? "Average" : "Needs Work";
    levelColor = swolf <= 42 ? "text-emerald-600" : swolf <= 50 ? "text-blue-500" : swolf <= 60 ? "text-amber-500" : "text-red-500";
  }

  const chartData = [
    { name: "Your SWOLF", value: swolf, fill: "hsl(var(--primary))" },
    { name: "Elite", value: input.poolLength >= 50 ? 65 : 42, fill: "#10b981" },
    { name: "Good", value: input.poolLength >= 50 ? 75 : 50, fill: "#94a3b8" },
    { name: "Average", value: input.poolLength >= 50 ? 85 : 60, fill: "#94a3b8" },
  ];

  const breakdown = [
    { label: "Pool Length", value: `${input.poolLength} m` },
    { label: "Strokes per Length", value: `${input.strokes}` },
    { label: "Time per Length", value: `${input.secondsPerLength} s` },
    { label: "SWOLF Score", value: `${swolf}` },
    { label: "Efficiency Level", value: level },
    { label: "SWOLF per 50 m", value: input.poolLength >= 50 ? `${swolf}` : `${(swolf * 2) - input.strokes}` },
  ];

  const summaryStats = [
    { label: "SWOLF Score", value: `${swolf}` },
    { label: "Efficiency Level", value: level },
    { label: "Strokes / Length", value: `${input.strokes}` },
    { label: "Time / Length", value: `${input.secondsPerLength} s` },
    { label: "Pool Length", value: `${input.poolLength} m` },
    { label: "Per 50 m Equivalent", value: input.poolLength >= 50 ? `${swolf}` : `${(swolf * 2) - input.strokes}` },
  ];

  return { swolf, level, levelColor, chartData, breakdown, summaryStats };
}

const DEFAULTS: SwolfInput = { strokes: 16, secondsPerLength: 25, poolLength: 25 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SwolfCalculator() {
  const [strokes, setStrokes] = useState(String(DEFAULTS.strokes));
  const [seconds, setSeconds] = useState(String(DEFAULTS.secondsPerLength));
  const [poolLength, setPoolLength] = useState(String(DEFAULTS.poolLength));
  const [result, setResult] = useState<SwolfResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSwolf({ strokes: parse(strokes, DEFAULTS.strokes), secondsPerLength: parse(seconds, DEFAULTS.secondsPerLength), poolLength: parse(poolLength, DEFAULTS.poolLength) }));
  const reset = () => {
    setStrokes(String(DEFAULTS.strokes));
    setSeconds(String(DEFAULTS.secondsPerLength));
    setPoolLength(String(DEFAULTS.poolLength));
    setResult(calcSwolf(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSwolf(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a SWOLF score?", answer: "SWOLF = strokes per length + seconds per length. It measures swimming efficiency: a lower score means you cover the same distance with fewer strokes and/or less time. Unlike raw speed, it rewards smooth, long strokes." },
    { question: "What is a good SWOLF?", answer: "In a 25 m pool: under 42 is elite, 42–50 good, 50–60 average, and above 60 needs work. In a 50 m pool, add roughly 25 (65/75/85). Compare only within the same pool length." },
    { question: "How do I improve my SWOLF?", answer: "Focus on stroke technique first: longer glide, better body position, less drag. Lower strokes per length while holding your time — or hold strokes while getting faster. Improving by 2–3 points is a meaningful gain." },
    { question: "Should I chase a low SWOLF always?", answer: "No — very low stroke counts with slow times are inefficient, just as very fast times with high stroke counts are. SWOLF balances both; use it alongside pace to find your personal efficiency sweet spot." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "SWOLF Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">SWOLF Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Strokes per Length</label>
                <div className={inp}><input type="number" value={strokes} onChange={(e) => setStrokes(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time per Length</label>
                <div className={inp}><input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">s</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Pool Length</label>
                <select value={poolLength} onChange={(e) => setPoolLength(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="25">25 m / yd (Short Course)</option>
                  <option value="50">50 m (Long Course)</option>
                </select>
              </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">SWOLF Score</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.swolf}</div>
                  <div className="text-sm text-muted-foreground mt-1">Efficiency: <span className={`font-semibold ${result.levelColor}`}>{result.level}</span> · {strokes} strokes + {seconds} s</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Strokes", `${strokes}`], ["Seconds", `${seconds} s`], ["Level", result.level]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Efficiency Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Your SWOLF vs Benchmarks</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">What SWOLF Measures</h2>
            <p>SWOLF combines stroke count and time per length into a single efficiency number. It was popularized by swimming coaches as a way to reward smooth technique — a swimmer can be fast but wasteful, or slow but efficient. SWOLF captures both dimensions at once.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting Your Score</h2>
            <p>In a 25 m pool, elite swimmers score under 42, good club swimmers 42–50, and most recreational swimmers 50–60. Long-course pools (50 m) add roughly 25 points to the benchmarks because each length doubles. Always compare within the same pool length.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Efficiency</h2>
            <p>Work on body position, rotation, and catch technique to reduce drag, then watch strokes per length drop while time holds. Track SWOLF monthly — a 2–3 point improvement indicates measurable technique gains.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/swolf-calculator" />
          <PopularCalculators exclude="/calculator/swolf-calculator" />
        </div>
      </div>
    </>
  );
}
