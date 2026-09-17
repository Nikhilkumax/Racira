"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface JitterResult {
  samples: number[];
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  jitter: number;
  target: number;
  aboveTarget: number;
  abovePct: number;
  lossPct: number;
  quality: string;
  curve: { n: number; latency: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcJitter(samples: number[], target: number, lossPct: number): JitterResult {
  const sorted = [...samples].sort((a, b) => a - b);
  const count = samples.length;
  const mean = count > 0 ? samples.reduce((s, v) => s + v, 0) / count : 0;
  const median = count > 0 ? (count % 2 === 1 ? sorted[(count - 1) / 2] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2) : 0;
  const min = count > 0 ? sorted[0] : 0;
  const max = count > 0 ? sorted[count - 1] : 0;
  const stdDev = count > 1 ? Math.sqrt(samples.reduce((s, v) => s + (v - mean) * (v - mean), 0) / (count - 1)) : 0;
  // Inter-arrival jitter: mean absolute difference between consecutive samples (RFC 3550 style)
  let jitter = 0;
  if (count > 1) {
    let sum = 0;
    for (let i = 1; i < count; i++) sum += Math.abs(samples[i] - samples[i - 1]);
    jitter = sum / (count - 1);
  }
  const aboveTarget = count > 0 ? samples.filter((v) => v > target).length : 0;
  const abovePct = count > 0 ? (aboveTarget / count) * 100 : 0;
  const quality = count === 0 ? "No data" : jitter < 10 && lossPct < 1 ? "Excellent" : jitter < 25 && lossPct < 3 ? "Good" : jitter < 50 && lossPct < 5 ? "Fair" : "Poor";
  const curve = samples.map((v, i) => ({ n: i + 1, latency: Number(v.toFixed(2)) }));
  const breakdown = [
    { label: "Samples Analyzed", value: `${count}` },
    { label: "Average Latency", value: `${fmt(mean)} ms` },
    { label: "Median Latency", value: `${fmt(median)} ms` },
    { label: "Minimum / Maximum", value: `${fmt(min)} / ${fmt(max)} ms` },
    { label: "Standard Deviation", value: `${fmt(stdDev)} ms` },
    { label: "Average Jitter (inter-arrival)", value: `${fmt(jitter)} ms` },
    { label: "Samples Above Target", value: `${aboveTarget} of ${count} (${fmt(abovePct, 1)}%)` },
    { label: "Packet Loss", value: `${fmt(lossPct, 2)}%` },
  ];
  const summaryStats = [
    { label: "Average Jitter", value: `${fmt(jitter)} ms` },
    { label: "Average Latency", value: `${fmt(mean)} ms` },
    { label: "Median Latency", value: `${fmt(median)} ms` },
    { label: "Std Deviation", value: `${fmt(stdDev)} ms` },
    { label: "Min / Max", value: `${fmt(min)} / ${fmt(max)} ms` },
    { label: "Above Target", value: `${aboveTarget} (${fmt(abovePct, 1)}%)` },
    { label: "Packet Loss", value: `${fmt(lossPct, 2)}%` },
    { label: "Connection Quality", value: quality },
  ];
  return { samples, count, mean, median, min, max, stdDev, jitter, target, aboveTarget, abovePct, lossPct, quality, curve, breakdown, summaryStats };
}

const DEFAULTS = { samples: "12, 14, 18, 22, 19, 16, 15, 24, 21, 17", target: "20", loss: "0.5" };

export default function JitterCalculator() {
  const [sampleText, setSampleText] = useState(DEFAULTS.samples);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [loss, setLoss] = useState(DEFAULTS.loss);
  const [result, setResult] = useState<JitterResult | null>(null);

  const targetNum = parseFloat(target);
  const lossNum = parseFloat(loss);
  const samples = sampleText.split(/[\s,;]+/).map((s) => parseFloat(s)).filter((v) => !isNaN(v));
  const errs: string[] = [];
  if (samples.length === 0) errs.push("Enter at least one latency sample in milliseconds (e.g. 12, 14, 18).");
  if (samples.length === 1) errs.push("Enter at least two samples to compute inter-arrival jitter.");
  if (samples.some((v) => v < 0)) errs.push("Latency values cannot be negative.");
  if (isNaN(targetNum) || targetNum <= 0) errs.push("Target latency must be greater than 0.");
  if (isNaN(lossNum) || lossNum < 0 || lossNum > 100) errs.push("Packet loss must be between 0 and 100%.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcJitter(samples, targetNum, lossNum)); };
  const reset = () => {
    setSampleText(DEFAULTS.samples); setTarget(DEFAULTS.target); setLoss(DEFAULTS.loss);
    setResult(calcJitter([12, 14, 18, 22, 19, 16, 15, 24, 21, 17], 20, 0.5));
  };
  useEffect(() => { setResult(calcJitter([12, 14, 18, 22, 19, 16, 15, 24, 21, 17], 20, 0.5)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[84px]";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What exactly is jitter?", answer: "Jitter is the variation in packet arrival times — the difference in latency between consecutive packets. This calculator uses the inter-arrival jitter definition: the mean absolute difference between successive latency samples." },
    { question: "Why does jitter matter for calls and games?", answer: "Voice, video, and gaming need consistent latency. Even with low average latency, high jitter causes stutter, audio gaps, and rubber-banding because packets arrive unevenly and buffers overflow." },
    { question: "What is a good jitter value?", answer: "Under 10 ms is generally excellent for real-time applications, under 30 ms acceptable, and above 50 ms problematic. Targets differ by connection type — fiber and cable usually do far better than congested Wi-Fi or satellite." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Jitter Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Jitter Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>Latency Samples (ms)</label>
                <textarea value={sampleText} onChange={e => setSampleText(e.target.value)} className={ta} placeholder="12, 14, 18, 22, 19 ..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Target Latency (ms)</label>
                  <div className={inp}><input type="number" value={target} onChange={e => setTarget(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">ms</span></div>
                </div>
                <div>
                  <label className={lbl}>Packet Loss (%)</label>
                  <div className={inp}><input type="number" value={loss} onChange={e => setLoss(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                </div>
              </div>
            </div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Average Jitter</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.jitter)} ms</div>
                <div className="text-sm text-muted-foreground mt-1">{result.quality} · {fmt(result.abovePct, 1)}% of samples above {result.target} ms target</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Avg Latency`, `${fmt(result.mean)} ms`], ["Min", `${fmt(result.min)} ms`], ["Max", `${fmt(result.max)} ms`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Latency Statistics</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Latency Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="n" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Sample", position: "insideBottom", offset: -4, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} ms`, "Latency"]} />
                    <ReferenceLine y={result.target} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Target", position: "insideTopRight", fontSize: 11, fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Each sample compared against your target latency</p>
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
            <h2 className="text-2xl font-bold mb-3">Measuring Inter-Arrival Jitter</h2>
            <p>This <strong>jitter calculator</strong> takes a sequence of ping latencies and measures how much they vary between consecutive packets. The average jitter is the mean of the absolute differences between successive samples — the same inter-arrival definition used by real-time protocol monitoring (RFC 3550).</p>
            <h2 className="text-2xl font-bold mb-3">Latency vs Jitter</h2>
            <p>Average latency tells you how long packets take; jitter tells you how consistent that time is. A stable 30 ms connection beats a connection averaging 15 ms that spikes to 80 ms, because real-time applications can smooth a constant delay but not an erratic one.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Jitter</h2>
            <p>Switch from Wi-Fi to ethernet, reduce bufferbloat with Quality-of-Service rules, close bandwidth-heavy background downloads, and prefer wired or fiber connections. The packet-loss percentage entered here rounds out the classic quality picture alongside latency and jitter.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/jitter-calculator" />
          <PopularCalculators exclude="/calculator/jitter-calculator" />
        </div>
      </div>
    </>
  );
}
