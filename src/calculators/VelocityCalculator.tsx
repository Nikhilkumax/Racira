"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const VelocityCalculator = () => {
  const DEFAULTS = { solveFor: "velocity", distance: "100", time: "10", velocity: "" };
  const [solveFor, setSolveFor] = useState(DEFAULTS.solveFor);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [time, setTime] = useState(DEFAULTS.time);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [result, setResult] = useState<any>(null);

  const calculate = (sf = solveFor, d = distance, t = time, v = velocity) => {
    const D = parseFloat(d) || 0;
    const T = parseFloat(t) || 0;
    const V = parseFloat(v) || 0;
    let calcV: number, calcD: number, calcT: number;
    if (sf === "velocity") {
      if (!D || !T || T <= 0) return;
      calcV = D / T; calcD = D; calcT = T;
    } else if (sf === "distance") {
      if (!V || !T || T <= 0) return;
      calcD = V * T; calcV = V; calcT = T;
    } else {
      if (!D || !V || V <= 0) return;
      calcT = D / V; calcD = D; calcV = V;
    }
    const kmh = calcV! * 3.6;
    const mph = calcV! * 2.23694;
    const kts = calcV! * 1.94384;
    const ftps = calcV! * 3.28084;
    const mach = calcV! / 343;
    const c = calcV! / 299792458;
    const chartData = [
      { name: "Walking", speed: 1.4 },
      { name: "Running", speed: 3.0 },
      { name: "Cycling", speed: 8.3 },
      { name: "Car (city)", speed: 13.9 },
      { name: "Car (hwy)", speed: 30 },
      { name: "You", speed: parseFloat(calcV!.toFixed(1)) },
    ];
    setResult({ V: calcV!, D: calcD!, T: calcT!, kmh, mph, kts, ftps, mach, c, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setSolveFor(DEFAULTS.solveFor); setDistance(DEFAULTS.distance); setTime(DEFAULTS.time); setVelocity(DEFAULTS.velocity);
    calculate(DEFAULTS.solveFor, DEFAULTS.distance, DEFAULTS.time, DEFAULTS.velocity);
  };

  const faqs = [
    { question: "What is velocity?", answer: "Velocity is the rate of change of displacement with respect to time. Unlike speed (a scalar), velocity is a vector — it has both magnitude and direction. Average velocity = displacement / time. For uniform motion: v = d/t. For our defaults: 100 m / 10 s = 10 m/s." },
    { question: "What is the difference between speed and velocity?", answer: "Speed is the magnitude of velocity — it is always positive. Velocity includes direction. If you run 100 m east, then 100 m west, in 60 seconds: speed = 200/60 = 3.33 m/s, but average velocity = 0 (net displacement is zero). Speed tells how fast; velocity tells how fast and in which direction." },
    { question: "What are common velocity units?", answer: "m/s (SI unit), km/h (everyday), mph (US/UK), knots (nautical/aviation), ft/s (US engineering). Conversions: 1 m/s = 3.6 km/h = 2.237 mph = 1.944 knots = 3.281 ft/s. Speed of sound ≈ 343 m/s. Speed of light = 299,792,458 m/s." },
    { question: "What is the velocity formula?", answer: "v = d / t (average velocity). For acceleration: v = v₀ + at. For constant acceleration: v² = v₀² + 2ad. These are the fundamental kinematic equations used in physics to solve motion problems. This calculator solves the basic v = d/t relationship." },
    { question: "Can this calculator solve for distance or time?", answer: "Yes — select what you want to solve for using the toggle buttons. Solve for velocity: v = d/t. Solve for distance: d = v × t. Solve for time: t = d/v. Enter two known values and the calculator finds the third." },
    { question: "How fast is Mach 1?", answer: "Mach 1 = the speed of sound ≈ 343 m/s (1,235 km/h or 768 mph) in dry air at 20°C. This varies with temperature and medium. Commercial jets fly at Mach 0.8–0.85. The SR-71 Blackbird reached Mach 3.3. The Space Shuttle re-entered at Mach 25." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Physics", href: "/calculator#physics" }, { label: "Velocity Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Velocity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Solve For</label>
              <div className="flex gap-2">
                {(["velocity", "distance", "time"] as const).map((s) => (
                  <button key={s} onClick={() => { setSolveFor(s); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${solveFor === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {solveFor !== "distance" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Distance</label>
                <div className="relative">
                  <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="100" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m</span>
                </div>
              </div>
            )}
            {solveFor !== "time" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Time</label>
                <div className="relative">
                  <input type="number" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">s</span>
                </div>
              </div>
            )}
            {solveFor !== "velocity" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Velocity</label>
                <div className="relative">
                  <input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate(solveFor, distance, time, velocity)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Result</div>
                <div className="text-4xl font-bold text-primary">
                  {solveFor === "velocity" && <>{fmt(result.V)} <span className="text-xl">m/s</span></>}
                  {solveFor === "distance" && <>{fmt(result.D)} <span className="text-xl">m</span></>}
                  {solveFor === "time" && <>{fmt(result.T)} <span className="text-xl">s</span></>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {fmt(result.D)} m in {fmt(result.T)} s = {fmt(result.V)} m/s
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Full Results</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Distance", value: `${fmt(result.D)} m` },
                    { label: "Time", value: `${fmt(result.T)} s` },
                    { label: "Velocity", value: `${fmt(result.V)} m/s` },
                    { label: "In km/h", value: fmt(result.kmh) },
                    { label: "In mph", value: fmt(result.mph) },
                    { label: "In knots", value: fmt(result.kts) },
                    { label: "In ft/s", value: fmt(result.ftps) },
                    { label: "Mach Number", value: fmt(result.mach, 4) },
                    { label: "Fraction of c", value: result.c.toExponential(3) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Speed Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 5, right: 15, left: 70, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)} m/s`} />
                    <Bar dataKey="speed" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Velocity", value: `${fmt(result.V)} m/s` },
                    { label: "Speed (km/h)", value: fmt(result.kmh) },
                    { label: "Speed (mph)", value: fmt(result.mph) },
                    { label: "Mach", value: fmt(result.mach, 4), border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Velocity Calculator?</h2>
            <p>A velocity calculator computes the speed of an object from distance and time, or solves for distance or time given the other two values. Velocity (v = d/t) is the fundamental kinematic quantity describing motion. Pre-filled with 100 meters covered in 10 seconds, the velocity is 10 m/s (36 km/h) — roughly the speed of an Olympic sprinter.</p>
            <h2>The Velocity Formula</h2>
            <p><strong>v = d / t</strong> — solve for velocity. <strong>d = v × t</strong> — solve for distance. <strong>t = d / v</strong> — solve for time. All three are rearrangements of the same relationship. Enter any two values and the calculator finds the third.</p>
            <h2>Speed vs Velocity</h2>
            <p>Speed is a scalar (magnitude only). Velocity is a vector (magnitude + direction). If you drive 100 km north then 100 km south in 4 hours: average speed = 50 km/h, but average velocity = 0 (net displacement is zero). In everyday language, "speed" and "velocity" are used interchangeably, but in physics they are distinct concepts.</p>
            <h2>Unit Conversions</h2>
            <p>1 m/s = 3.6 km/h = 2.237 mph = 1.944 knots = 3.281 ft/s. Common reference speeds: human walking ≈ 1.4 m/s, cycling ≈ 8 m/s, car on highway ≈ 30 m/s, commercial jet ≈ 250 m/s, speed of sound ≈ 343 m/s, speed of light = 299,792,458 m/s. This calculator shows all major unit conversions for your input velocity.</p>
            <h2>Kinematic Equations for Accelerated Motion</h2>
            <p>When acceleration is involved: v = v₀ + at. d = v₀t + ½at². v² = v₀² + 2ad. d = ½(v₀ + v)t. These equations describe uniformly accelerated motion (constant acceleration). For non-constant acceleration, calculus (integration) is required: v = ∫a dt, x = ∫v dt.</p>
            <h2>Relativistic Velocity</h2>
            <p>At velocities approaching the speed of light, Newtonian mechanics breaks down. Special relativity modifies the velocity addition rule: u = (v₁ + v₂) / (1 + v₁v₂/c²). At 90% of light speed, time dilation becomes significant: 1 second for the traveler = 2.29 seconds for a stationary observer. This calculator displays Mach number and fraction of c for context.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/velocity-calculator" />
          <PopularCalculators exclude="/calculator/velocity-calculator" />
        </div>
      </div>
    </>
  );
};

export default VelocityCalculator;
