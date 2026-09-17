"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface WorkPowerInput {
  force: number; // N
  distance: number; // m
  angleDeg: number; // degrees
  time: number; // s
}

interface WorkPowerResult {
  work: number; // J
  power: number; // W
  parallelForce: number; // N
  chartData: { name: string; work: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWorkPower(input: WorkPowerInput): WorkPowerResult {
  const { force, distance, angleDeg, time } = input;
  const theta = (angleDeg * Math.PI) / 180;
  const parallelForce = force * Math.cos(theta);
  const work = parallelForce * distance;
  const power = time > 0 ? work / time : 0;

  // Work vs angle: cos(theta) drops to zero at 90°
  const angles = [0, 30, 60, 90];
  const chartData = angles.map((a, i) => ({
    name: `${a}°`,
    work: force * Math.cos((a * Math.PI) / 180) * distance,
    fill: a === angleDeg ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Applied Force", value: `${force.toFixed(2)} N` },
    { label: "Distance", value: `${distance.toFixed(2)} m` },
    { label: "Angle to Motion", value: `${angleDeg.toFixed(1)}°` },
    { label: "Force Component Along Motion", value: `${parallelForce.toFixed(2)} N` },
    { label: "Work (W = F·d·cos θ)", value: `${work.toFixed(2)} J` },
    { label: "Time", value: `${time.toFixed(2)} s` },
    { label: "Power (P = W ÷ t)", value: `${power.toFixed(2)} W` },
  ];

  const summaryStats = [
    { label: "Work Done", value: `${work.toFixed(2)} J` },
    { label: "Power", value: `${power.toFixed(2)} W` },
    { label: "Parallel Force", value: `${parallelForce.toFixed(2)} N` },
    { label: "Angle", value: `${angleDeg.toFixed(1)}°` },
    { label: "Formula", value: "W = F·d·cos(θ)" },
    { label: "Horsepower", value: `${(power / 745.7).toFixed(4)} hp` },
  ];

  return { work, power, parallelForce, chartData, breakdown, summaryStats };
}

const DEFAULTS: WorkPowerInput = { force: 100, distance: 5, angleDeg: 0, time: 2 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WorkPowerCalculator() {
  const [force, setForce] = useState(String(DEFAULTS.force));
  const [distance, setDistance] = useState(String(DEFAULTS.distance));
  const [angle, setAngle] = useState(String(DEFAULTS.angleDeg));
  const [time, setTime] = useState(String(DEFAULTS.time));
  const [result, setResult] = useState<WorkPowerResult | null>(null);

  const parse = (s: string, fallback: number, min = 0) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const calculate = () =>
    setResult(
      calcWorkPower({
        force: parse(force, DEFAULTS.force),
        distance: parse(distance, DEFAULTS.distance),
        angleDeg: Math.min(180, Math.max(0, parse(angle, DEFAULTS.angleDeg))),
        time: Math.max(0.01, parse(time, DEFAULTS.time, 0.01)),
      })
    );
  const reset = () => {
    setForce(String(DEFAULTS.force));
    setDistance(String(DEFAULTS.distance));
    setAngle(String(DEFAULTS.angleDeg));
    setTime(String(DEFAULTS.time));
    setResult(calcWorkPower(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWorkPower(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is work in physics?", answer: "Work is energy transferred when a force moves an object: W = F·d·cos(θ), where θ is the angle between the force and the direction of motion. Only the force component parallel to the motion does work — pushing sideways on a car rolling forward does no work on it." },
    { question: "Why does the angle matter?", answer: "The cosine factor means work is maximized when the force is aligned with motion (0°), falls to half at 60°, and is zero at 90°. Lifting a box straight up does full work; carrying it horizontally at arm's length does no work on the box — gravity does it for you." },
    { question: "What is the difference between work and power?", answer: "Work is the total energy transferred (joules); power is the rate of transfer (watts = joules per second). A small motor and a huge one can do the same work — the huge one just does it faster, which is why power ratings matter." },
    { question: "What units should I use?", answer: "Force in newtons, distance in meters, time in seconds. Work comes out in joules and power in watts. One horsepower equals 745.7 watts, shown in the summary for easy conversion." },
    { question: "Can work be negative?", answer: "Yes. When the force opposes the motion (θ between 90° and 180°), cos(θ) is negative and so is the work — energy is being removed, like brakes slowing a car or friction stopping a sliding box." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Work Power Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Work Power Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Force (N)</label>
                <div className={inp}><input type="number" value={force} onChange={(e) => setForce(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Distance (m)</label>
                <div className={inp}><input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={ci} min={0} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Angle to Motion (°)</label>
                <div className={inp}><input type="number" value={angle} onChange={(e) => setAngle(e.target.value)} className={ci} min={0} max={180} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time (s)</label>
                <div className={inp}><input type="number" value={time} onChange={(e) => setTime(e.target.value)} className={ci} min={0.01} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Work Done (W)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.work.toFixed(2)} <span className="text-2xl text-muted-foreground">J</span></div>
                  <div className="text-sm text-muted-foreground mt-1">Power: {result.power.toFixed(2)} W over {time}s</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Work", `${result.work.toFixed(1)} J`], ["Power", `${result.power.toFixed(1)} W`], ["Parallel Force", `${result.parallelForce.toFixed(1)} N`]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Work vs Angle</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(1) + " J", "Work"]} />
                      <Bar dataKey="work" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">The cos(θ) factor: work peaks at 0°, halves at 60°, and vanishes at 90°.</p>
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
            <h2 className="text-2xl font-bold mb-3">Work, Energy, and Power</h2>
            <p>In physics, work is the transfer of energy by a force acting through a distance. The precise definition is W = F·d·cos(θ): the product of the force, the distance, and the cosine of the angle between them. Power then measures how quickly that work is done, P = W ÷ t, in watts.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Cosine Matters</h2>
            <p>Forces have direction, and only the component along the path of motion contributes to work. A force applied straight down on a cart rolling horizontally does zero work on it, no matter how hard you push — the cart's motion never aligns with your push. The cosine factor encodes this geometry.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Numbers</h2>
            <p>Lifting a 10 kg box 1 meter requires about 98 J of work. A 60 W light bulb converts 60 J of electrical energy per second. Climbing stairs for a minute at moderate pace does roughly 5,000 J of work — about the same energy the bulb uses in 83 seconds. Watts and joules are everywhere once you know how to count them.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/work-power-calculator" />
          <PopularCalculators exclude="/calculator/work-power-calculator" />
        </div>
      </div>
    </>
  );
}
