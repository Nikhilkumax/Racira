"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TriInput {
  swimDistanceM: number;
  swimPaceMin: number;
  swimPaceSec: number;
  bikeDistanceMi: number;
  bikeSpeedMph: number;
  runDistanceMi: number;
  runPaceMin: number;
  runPaceSec: number;
  transition1Sec: number;
  transition2Sec: number;
}

interface TriResult {
  swimTime: number;
  bikeTime: number;
  runTime: number;
  totalTime: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtTotal(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtLeg(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcTri(input: TriInput): TriResult {
  const swimTime = input.swimDistanceM > 0 ? (input.swimDistanceM / 100) * (input.swimPaceMin * 60 + input.swimPaceSec) : 0;
  const bikeTime = input.bikeSpeedMph > 0 ? (input.bikeDistanceMi / input.bikeSpeedMph) * 3600 : 0;
  const runTime = input.runDistanceMi > 0 ? input.runDistanceMi * (input.runPaceMin * 60 + input.runPaceSec) : 0;
  const totalTime = swimTime + bikeTime + runTime + input.transition1Sec + input.transition2Sec;

  const donutData = [
    { name: "Swim", value: Number(swimTime.toFixed(0)), color: "hsl(var(--primary))" },
    { name: "Bike", value: Number(bikeTime.toFixed(0)), color: "#10b981" },
    { name: "Run", value: Number(runTime.toFixed(0)), color: "#f59e0b" },
    { name: "Transitions", value: Number((input.transition1Sec + input.transition2Sec).toFixed(0)), color: "#94a3b8" },
  ];

  const breakdown = [
    { label: "Swim (1500 m @ 2:00/100)", value: fmtLeg(swimTime) },
    { label: "Transition 1", value: `${input.transition1Sec} s` },
    { label: "Bike (40 km @ 20 mph)", value: fmtLeg(bikeTime) },
    { label: "Transition 2", value: `${input.transition2Sec} s` },
    { label: "Run (10 km @ 10:00/mi)", value: fmtLeg(runTime) },
    { label: "Total Time", value: fmtTotal(totalTime) },
  ];

  const summaryStats = [
    { label: "Total Finish Time", value: fmtTotal(totalTime) },
    { label: "Swim Leg", value: fmtLeg(swimTime) },
    { label: "Bike Leg", value: fmtLeg(bikeTime) },
    { label: "Run Leg", value: fmtLeg(runTime) },
    { label: "Transitions", value: `${input.transition1Sec + input.transition2Sec} s` },
    { label: "Bike + Run + Swim", value: fmtLeg(swimTime + bikeTime + runTime) },
  ];

  return { swimTime, bikeTime, runTime, totalTime, donutData, breakdown, summaryStats };
}

const DEFAULTS: TriInput = { swimDistanceM: 1500, swimPaceMin: 2, swimPaceSec: 0, bikeDistanceMi: 24.85, bikeSpeedMph: 20, runDistanceMi: 6.2, runPaceMin: 10, runPaceSec: 0, transition1Sec: 90, transition2Sec: 60 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TriathlonTimeCalculator() {
  const [swimDist, setSwimDist] = useState(String(DEFAULTS.swimDistanceM));
  const [swimMin, setSwimMin] = useState(String(DEFAULTS.swimPaceMin));
  const [swimSec, setSwimSec] = useState(String(DEFAULTS.swimPaceSec));
  const [bikeDist, setBikeDist] = useState(String(DEFAULTS.bikeDistanceMi));
  const [bikeSpeed, setBikeSpeed] = useState(String(DEFAULTS.bikeSpeedMph));
  const [runDist, setRunDist] = useState(String(DEFAULTS.runDistanceMi));
  const [runMin, setRunMin] = useState(String(DEFAULTS.runPaceMin));
  const [runSec, setRunSec] = useState(String(DEFAULTS.runPaceSec));
  const [t1, setT1] = useState(String(DEFAULTS.transition1Sec));
  const [t2, setT2] = useState(String(DEFAULTS.transition2Sec));
  const [result, setResult] = useState<TriResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcTri({
      swimDistanceM: parse(swimDist, DEFAULTS.swimDistanceM),
      swimPaceMin: parse(swimMin, DEFAULTS.swimPaceMin),
      swimPaceSec: parse(swimSec, DEFAULTS.swimPaceSec),
      bikeDistanceMi: parse(bikeDist, DEFAULTS.bikeDistanceMi),
      bikeSpeedMph: parse(bikeSpeed, DEFAULTS.bikeSpeedMph),
      runDistanceMi: parse(runDist, DEFAULTS.runDistanceMi),
      runPaceMin: parse(runMin, DEFAULTS.runPaceMin),
      runPaceSec: parse(runSec, DEFAULTS.runPaceSec),
      transition1Sec: parse(t1, DEFAULTS.transition1Sec),
      transition2Sec: parse(t2, DEFAULTS.transition2Sec),
    }));
  const reset = () => {
    setSwimDist(String(DEFAULTS.swimDistanceM));
    setSwimMin(String(DEFAULTS.swimPaceMin));
    setSwimSec(String(DEFAULTS.swimPaceSec));
    setBikeDist(String(DEFAULTS.bikeDistanceMi));
    setBikeSpeed(String(DEFAULTS.bikeSpeedMph));
    setRunDist(String(DEFAULTS.runDistanceMi));
    setRunMin(String(DEFAULTS.runPaceMin));
    setRunSec(String(DEFAULTS.runPaceSec));
    setT1(String(DEFAULTS.transition1Sec));
    setT2(String(DEFAULTS.transition2Sec));
    setResult(calcTri(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcTri(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How is finish time estimated?", answer: "Swim time = distance ÷ 100 × pace per 100; bike time = distance ÷ speed; run time = distance × pace per mile; then both transitions are added. The defaults model a standard Olympic-distance triathlon (1.5 km / 40 km / 10 km)." },
    { question: "What is a good Olympic-distance time?", answer: "Sub-2:30 is competitive, 2:30–3:00 is a strong age-group result, 3:00–3:30 is a solid first-time goal, and 3:30+ is fine for finishing-focused athletes. Course profile and conditions swing times by 10+ minutes." },
    { question: "How should I pace the bike leg?", answer: "Ride at about 75–85% of your threshold effort and save your legs for the run — most age-groupers ride too hard and pay for it on the run. Practice 'brick' sessions (bike immediately followed by run) to adapt." },
    { question: "How much do transitions matter?", answer: "Two fast transitions save 2–5 minutes. Practice the sequence (wetsuit off, helmet on, shoes clipped) so each transition takes under 90 seconds. In a 3-hour race, that is real time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Triathlon Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Triathlon Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Swim</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Distance</label>
                  <div className={inp}><input type="number" value={swimDist} onChange={(e) => setSwimDist(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">m</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Pace per 100 m</label>
                  <div className="grid grid-cols-2 gap-1">
                    <div className={inp}><input type="number" value={swimMin} onChange={(e) => setSwimMin(e.target.value)} className={ci} /><span className="pr-2 text-muted-foreground text-xs">min</span></div>
                    <div className={inp}><input type="number" value={swimSec} onChange={(e) => setSwimSec(e.target.value)} className={ci} /><span className="pr-2 text-muted-foreground text-xs">sec</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Bike</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Distance</label>
                  <div className={inp}><input type="number" value={bikeDist} onChange={(e) => setBikeDist(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mi</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Avg Speed</label>
                  <div className={inp}><input type="number" value={bikeSpeed} onChange={(e) => setBikeSpeed(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mph</span></div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Run</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Distance</label>
                  <div className={inp}><input type="number" value={runDist} onChange={(e) => setRunDist(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mi</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Pace per Mile</label>
                  <div className="grid grid-cols-2 gap-1">
                    <div className={inp}><input type="number" value={runMin} onChange={(e) => setRunMin(e.target.value)} className={ci} /><span className="pr-2 text-muted-foreground text-xs">min</span></div>
                    <div className={inp}><input type="number" value={runSec} onChange={(e) => setRunSec(e.target.value)} className={ci} /><span className="pr-2 text-muted-foreground text-xs">sec</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Transitions</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Transition 1</label>
                  <div className={inp}><input type="number" value={t1} onChange={(e) => setT1(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">s</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Transition 2</label>
                  <div className={inp}><input type="number" value={t2} onChange={(e) => setT2(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">s</span></div>
                </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Finish Time</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{fmtTotal(result.totalTime)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Swim {fmtLeg(result.swimTime)} · Bike {fmtLeg(result.bikeTime)} · Run {fmtLeg(result.runTime)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Swim", fmtLeg(result.swimTime)], ["Bike", fmtLeg(result.bikeTime)], ["Run", fmtLeg(result.runTime)]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Leg Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Time Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [fmtLeg(v), ""]} />
                      <Legend />
                    </PieChart>
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
            <h2 className="text-2xl font-bold mb-3">Planning a Triathlon Finish</h2>
            <p>Finish time is the sum of three legs plus two transitions. Estimate each leg from your sustainable paces: swim from pace per 100 m, bike from average speed, and run from pace per mile. The defaults model a standard Olympic-distance race (1.5 km swim, 40 km bike, 10 km run).</p>
            <h2 className="text-2xl font-bold mb-3">Realistic Targets</h2>
            <p>For Olympic distance: sub-2:30 is competitive, 2:30–3:00 a strong age-group result, and 3:00–3:30 a solid first goal. Most age-groupers finish in 2:45–3:30. Course hills, wind, water temperature, and wetsuit rules all shift times beyond the math.</p>
            <h2 className="text-2xl font-bold mb-3">The Bike-Run Tradeoff</h2>
            <p>The classic triathlon error is riding too hard and dying on the run. Plan the bike at 75–85% of threshold effort, practice brick sessions, and keep transitions under 90 seconds each. Total time follows from pacing discipline.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/triathlon-time-calculator" />
          <PopularCalculators exclude="/calculator/triathlon-time-calculator" />
        </div>
      </div>
    </>
  );
}
