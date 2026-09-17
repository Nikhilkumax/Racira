"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SleepInput {
  mode: "wake" | "sleep";
  time: string;
  latency: number;
}

interface SleepOption {
  cycles: number;
  time: string;
  hours: number;
}

interface SleepResult {
  primary: SleepOption;
  options: SleepOption[];
  chartData: { name: string; hours: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSleep(input: SleepInput): SleepResult {
  const [hours, minutes] = input.time.split(":").map(Number);
  const base = new Date();
  base.setHours(hours, minutes, 0, 0);
  const cycleMs = 90 * 60 * 1000;
  const latMs = input.latency * 60 * 1000;

  const options: SleepOption[] = [];
  for (let i = 3; i <= 6; i++) {
    const t = input.mode === "wake"
      ? new Date(base.getTime() - i * cycleMs - latMs)
      : new Date(base.getTime() + latMs + i * cycleMs);
    options.push({
      cycles: i,
      time: t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      hours: (i * 90) / 60,
    });
  }

  const primary = options.find((o) => o.cycles === 5) ?? options[0];

  const chartData = options.map((o) => ({
    name: `${o.cycles} cycles`,
    hours: o.hours,
    fill: o.cycles === 5 ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Mode", value: input.mode === "wake" ? "Waking up at a set time" : "Going to bed at a set time" },
    { label: "Anchor Time", value: input.time },
    { label: "Time to Fall Asleep", value: `${input.latency} min` },
    { label: "Sleep Cycle Length", value: "90 minutes" },
    ...options.map((o) => ({ label: `${o.cycles} cycles (${o.hours.toFixed(1)} hrs)`, value: o.time })),
  ];

  const summaryStats = [
    { label: "Recommended Time", value: primary.time },
    { label: "Sleep Duration", value: `${primary.hours.toFixed(1)} hours` },
    { label: "Sleep Cycles", value: `${primary.cycles} cycles` },
    { label: "Options Shown", value: `${options.length} (3–6 cycles)` },
    { label: "Cycle Length", value: "90 min" },
    { label: "Time to Fall Asleep", value: `${input.latency} min` },
  ];

  return { primary, options, chartData, breakdown, summaryStats };
}

const DEFAULTS: SleepInput = { mode: "wake", time: "07:00", latency: 15 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SleepCalculator() {
  const [mode, setMode] = useState<SleepInput["mode"]>(DEFAULTS.mode);
  const [time, setTime] = useState(DEFAULTS.time);
  const [latency, setLatency] = useState(String(DEFAULTS.latency));
  const [result, setResult] = useState<SleepResult | null>(null);

  const calculate = () =>
    setResult(calcSleep({ mode, time: time || DEFAULTS.time, latency: Number(latency) || DEFAULTS.latency }));
  const reset = () => {
    setMode(DEFAULTS.mode);
    setTime(DEFAULTS.time);
    setLatency(String(DEFAULTS.latency));
    setResult(calcSleep(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSleep(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a sleep cycle?", answer: "A sleep cycle consists of light sleep, deep sleep, and REM (Rapid Eye Movement) sleep, averaging about 90 minutes. A typical night consists of 4–6 cycles, and waking at the end of a cycle leaves you far more refreshed than waking mid-cycle." },
    { question: "Why do I feel groggy even after 8 hours of sleep?", answer: "This is sleep inertia. It often happens when your alarm wakes you in the middle of deep sleep (Stage 3). Waking at the end of a 90-minute cycle — even with slightly less total sleep — usually leaves you feeling more alert." },
    { question: "How long does it take to fall asleep?", answer: "The average adult takes 15–20 minutes to fall asleep (sleep latency). Falling asleep instantly is a sign of sleep deprivation; regularly taking over an hour may indicate insomnia." },
    { question: "How many hours should I sleep?", answer: "Most adults need 5–6 full cycles (7.5–9 hours) of actual sleep. Individual needs vary by age, genetics, and daily physical exertion. This calculator marks 5–6 cycles as optimal." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Sleep Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sleep Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">What are you trying to figure out?</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as SleepInput["mode"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="wake">I want to wake up at...</option>
                <option value="sleep">I am going to sleep at...</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{mode === "wake" ? "Target Wake Time" : "Time Going to Bed"}</label>
                <div className={inp}><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time to Fall Asleep</label>
                <select value={latency} onChange={(e) => setLatency(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes (Average)</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{mode === "wake" ? "Recommended Bedtime" : "Recommended Wake Time"}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.primary.time}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.primary.hours.toFixed(1)} hours of sleep · {result.primary.cycles} cycles · incl. {latency} min to fall asleep</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["4 Cycles (6h)", result.options.find((o) => o.cycles === 4)?.time ?? "—"], ["5 Cycles (7.5h)", result.options.find((o) => o.cycles === 5)?.time ?? "—"], ["6 Cycles (9h)", result.options.find((o) => o.cycles === 6)?.time ?? "—"]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">{mode === "wake" ? "Suggested Bedtimes" : "Suggested Wake Times"}</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 + 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sleep Duration by Cycle Count</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} hours`, ""]} />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">The Science of Sleep Cycles</h2>
            <p>Sleep is not a uniform state. Throughout the night your brain cycles through light sleep, deep sleep, and REM. Waking during deep sleep (Stage 3) causes grogginess and disorientation, while waking at the end of a cycle — during light sleep or REM — leaves you feeling alert and refreshed.</p>
            <h2 className="text-2xl font-bold mb-3">How Long Should You Sleep?</h2>
            <p>Most adults need 5 or 6 full sleep cycles per night — 7.5 to 9 hours of actual sleep. Individual needs vary with genetics, daily exertion, and age. This calculator treats 5 and 6 cycles as optimal and includes your sleep latency (time to fall asleep) so the target time is accurate.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Sleep Hygiene</h2>
            <p>Timing matters, but so does quality. Keep the bedroom cool (around 65°F), avoid blue light from screens an hour before bed, and keep a consistent bedtime every night, including weekends. Waking up at the same time each day anchors your circadian rhythm.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sleep-calculator" />
          <PopularCalculators exclude="/calculator/sleep-calculator" />
        </div>
      </div>
    </>
  );
}
