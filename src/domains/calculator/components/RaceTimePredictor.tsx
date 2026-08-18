"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RaceInput {
  fromDistanceMiles: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetDistanceMiles: number;
}

interface RaceResult {
  targetSeconds: number;
  targetLabel: string;
  predictions: { name: string; miles: number; minutes: number; label: string }[];
  chartData: { name: string; minutes: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const RACE_DISTANCES = [
  { name: "5K", miles: 3.107 },
  { name: "10K", miles: 6.214 },
  { name: "Half Marathon", miles: 13.109 },
  { name: "Marathon", miles: 26.219 },
];

function fmtTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcRace(input: RaceInput): RaceResult {
  const baseSeconds = input.hours * 3600 + input.minutes * 60 + input.seconds;
  // Riegel formula: T2 = T1 × (D2 / D1)^1.06
  const predict = (miles: number) =>
    baseSeconds > 0 && input.fromDistanceMiles > 0 ? baseSeconds * Math.pow(miles / input.fromDistanceMiles, 1.06) : 0;

  const predictions = [
    { name: "5K", miles: 3.107, minutes: predict(3.107) / 60, label: fmtTime(predict(3.107)) },
    { name: "10K", miles: 6.214, minutes: predict(6.214) / 60, label: fmtTime(predict(6.214)) },
    { name: "Half Marathon", miles: 13.109, minutes: predict(13.109) / 60, label: fmtTime(predict(13.109)) },
    { name: "Marathon", miles: 26.219, minutes: predict(26.219) / 60, label: fmtTime(predict(26.219)) },
  ];

  const target = predictions.find((p) => Math.abs(p.miles - input.targetDistanceMiles) < 0.01);
  const targetSeconds = target ? target.minutes * 60 : predict(input.targetDistanceMiles);
  const targetName = target ? target.name : `${input.targetDistanceMiles.toFixed(1)} mi`;
  const targetLabel = fmtTime(targetSeconds);

  const chartData = predictions.map((p) => ({
    name: p.name,
    minutes: Number(p.minutes.toFixed(1)),
    fill: Math.abs(p.miles - input.targetDistanceMiles) < 0.01 ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Reference Distance", value: `${input.fromDistanceMiles} mi` },
    { label: "Reference Time", value: fmtTime(baseSeconds) },
    { label: "Target Distance", value: targetName },
    { label: "Predicted Time", value: targetLabel },
    ...predictions.map((p) => ({ label: p.name, value: p.label })),
    { label: "Formula", value: "Riegel: T2 = T1 × (D2/D1)^1.06" },
  ];

  const summaryStats = [
    { label: "Predicted Time", value: targetLabel },
    { label: "Target Distance", value: targetName },
    { label: "5K Prediction", value: predictions[0].label },
    { label: "10K Prediction", value: predictions[1].label },
    { label: "Half Marathon", value: predictions[2].label },
    { label: "Marathon", value: predictions[3].label },
  ];

  return { targetSeconds, targetLabel, predictions, chartData, breakdown, summaryStats };
}

const DEFAULTS: RaceInput = { fromDistanceMiles: 6.214, hours: 0, minutes: 45, seconds: 0, targetDistanceMiles: 13.109 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RaceTimePredictor() {
  const [fromDistance, setFromDistance] = useState(String(DEFAULTS.fromDistanceMiles));
  const [hours, setHours] = useState(String(DEFAULTS.hours));
  const [minutes, setMinutes] = useState(String(DEFAULTS.minutes));
  const [seconds, setSeconds] = useState(String(DEFAULTS.seconds));
  const [target, setTarget] = useState(String(DEFAULTS.targetDistanceMiles));
  const [result, setResult] = useState<RaceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcRace({
      fromDistanceMiles: parse(fromDistance, DEFAULTS.fromDistanceMiles),
      hours: parse(hours, DEFAULTS.hours),
      minutes: parse(minutes, DEFAULTS.minutes),
      seconds: parse(seconds, DEFAULTS.seconds),
      targetDistanceMiles: parse(target, DEFAULTS.targetDistanceMiles),
    }));
  const reset = () => {
    setFromDistance(String(DEFAULTS.fromDistanceMiles));
    setHours(String(DEFAULTS.hours));
    setMinutes(String(DEFAULTS.minutes));
    setSeconds(String(DEFAULTS.seconds));
    setTarget(String(DEFAULTS.targetDistanceMiles));
    setResult(calcRace(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcRace(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How does the Riegel formula work?", answer: "The Riegel formula (T2 = T1 × (D2/D1)^1.06) assumes your pace degrades at a predictable rate as distance grows — the 1.06 exponent reflects fatigue. It is widely used by race planners and is reasonably accurate for well-trained runners racing at consistent effort." },
    { question: "How accurate is it?", answer: "For runners with good endurance, predictions are typically within a few percent. It tends to overestimate for sprinters and underestimate for ultrarunners, and it assumes you trained specifically for the target distance — a marathon prediction from a 5K time assumes marathon-specific fitness." },
    { question: "What should I use as my reference time?", answer: "A recent race at a hard, consistent effort is best. Avoid using a training run or a race with unusual conditions (hills, heat, wind). The fresher and more race-like the reference, the better the prediction." },
    { question: "Why is the exponent 1.06?", answer: "The 1.06 exponent was derived from analyzing world-record and elite performances across distances: doubling distance takes roughly 2^1.06 ≈ 2.08× the time, not 2×. It accounts for the physiological cost of maintaining pace over longer durations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Race Time Predictor" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Race Time Predictor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Reference Race Distance</label>
              <select value={fromDistance} onChange={(e) => setFromDistance(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="3.107">5K</option>
                <option value="6.214">10K</option>
                <option value="13.109">Half Marathon</option>
                <option value="26.219">Marathon</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Reference Time</label>
              <div className="grid grid-cols-3 gap-2">
                <div className={inp}><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hr</span></div>
                <div className={inp}><input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
                <div className={inp}><input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">sec</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Target Distance</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="3.107">5K</option>
                <option value="6.214">10K</option>
                <option value="13.109">Half Marathon</option>
                <option value="26.219">Marathon</option>
              </select>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Predicted {result.summaryStats[1].value}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.targetLabel}</div>
                  <div className="text-sm text-muted-foreground mt-1">Riegel formula · from {Number(hours || 0).toFixed(0)}h {Number(minutes || 0).toFixed(0)}m {Number(seconds || 0).toFixed(0)}s at {fromDistance} mi</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["5K", result.predictions[0].label], ["10K", result.predictions[1].label], ["Half", result.predictions[2].label]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Predictions Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Predicted Finish Times (minutes)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} min`, ""]} />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">How Race Predictions Work</h2>
            <p>The Riegel formula — T2 = T1 × (D2/D1)^1.06 — models how your pace slows as distance increases. Derived from elite performance data, it estimates what your current fitness would produce at another distance. It is a planning tool: pick realistic goal times, then train specifically for the target distance.</p>
            <h2 className="text-2xl font-bold mb-3">Getting a Reliable Reference</h2>
            <p>Use a recent race at hard, consistent effort on a fair course. Training runs, extreme weather, or significant elevation changes distort predictions. The more race-like your reference effort, the more trustworthy the output.</p>
            <h2 className="text-2xl font-bold mb-3">Limitations</h2>
            <p>Predictions assume endurance-specific training for the target distance. A 5K-derived marathon prediction is optimistic unless you have marathon-long runs in your build. Treat results as target bands (±2–3%), not guarantees.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/race-time-predictor" />
          <PopularCalculators exclude="/calculator/race-time-predictor" />
        </div>
      </div>
    </>
  );
}
