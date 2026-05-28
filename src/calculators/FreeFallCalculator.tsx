"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const PLANETS: Record<string, number> = {
  "Earth": 9.81, "Moon": 1.62, "Mars": 3.71, "Jupiter": 24.79, "Venus": 8.87, "Mercury": 3.70, "Saturn": 10.44, "Neptune": 11.15,
};

const FreeFallCalculator = () => {
  const DEFAULTS = { solveFor: "time", height: "50", time: "", velocity: "", planet: "Earth" };
  const [solveFor, setSolveFor] = useState(DEFAULTS.solveFor);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [time, setTime] = useState(DEFAULTS.time);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [planet, setPlanet] = useState(DEFAULTS.planet);
  const [result, setResult] = useState<any>(null);

  const calculate = (sf = solveFor, h = height, t = time, v = velocity, pl = planet) => {
    const g = PLANETS[pl] || 9.81;
    if (sf === "time") {
      const H = parseFloat(h) || 0;
      if (H <= 0) return;
      const T = Math.sqrt(2 * H / g);
      const V = g * T;
      const chartData: { t: number; h: number; v: number }[] = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const ti = (T / steps) * i;
        chartData.push({ t: parseFloat(ti.toFixed(2)), h: parseFloat((H - 0.5 * g * ti * ti).toFixed(1)), v: parseFloat((g * ti).toFixed(1)) });
      }
      setResult({ H, T, V, g, chartData, pl });
    } else if (sf === "height") {
      const T = parseFloat(t) || 0;
      if (T <= 0) return;
      const H = 0.5 * g * T * T;
      const V = g * T;
      const chartData: { t: number; h: number; v: number }[] = [];
      for (let i = 0; i <= 20; i++) {
        const ti = (T / 20) * i;
        chartData.push({ t: parseFloat(ti.toFixed(2)), h: parseFloat((0.5 * g * ti * ti).toFixed(1)), v: parseFloat((g * ti).toFixed(1)) });
      }
      setResult({ H, T, V, g, chartData, pl });
    } else {
      const V = parseFloat(v) || 0;
      if (V <= 0) return;
      const T = V / g;
      const H = 0.5 * g * T * T;
      const chartData: { t: number; h: number; v: number }[] = [];
      for (let i = 0; i <= 20; i++) {
        const ti = (T / 20) * i;
        chartData.push({ t: parseFloat(ti.toFixed(2)), h: parseFloat((0.5 * g * ti * ti).toFixed(1)), v: parseFloat((g * ti).toFixed(1)) });
      }
      setResult({ H, T, V, g, chartData, pl });
    }
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setSolveFor(DEFAULTS.solveFor); setHeight(DEFAULTS.height); setTime(DEFAULTS.time); setVelocity(DEFAULTS.velocity); setPlanet(DEFAULTS.planet); calculate(DEFAULTS.solveFor, DEFAULTS.height, DEFAULTS.time, DEFAULTS.velocity, DEFAULTS.planet); };

  const faqs = [
    { question: "What is free fall?", answer: "Free fall is motion under the sole influence of gravity, with no air resistance. In a vacuum, all objects — regardless of mass — fall at the same rate. Galileo demonstrated this by (allegedly) dropping objects from the Pisa tower. On Earth, free-fall acceleration is approximately 9.81 m/s²." },
    { question: "What are the free fall formulas?", answer: "h = ½gt² (height fallen in time t). t = √(2h/g) (time to fall height h). v = gt (velocity at time t). v = √(2gh) (velocity after falling h). These assume starting from rest with no air resistance." },
    { question: "Does mass affect free fall?", answer: "No — in the absence of air resistance, all objects fall at the same rate regardless of mass. This was dramatically demonstrated by Apollo 15 astronaut David Scott on the Moon in 1971, who dropped a hammer and feather simultaneously — both hit the surface at the same time." },
    { question: "What is terminal velocity?", answer: "In reality, air resistance opposes motion. As an object falls faster, air drag increases until it equals gravitational force. At that point, acceleration stops and the object reaches terminal velocity. For a skydiver: ~55 m/s (200 km/h) belly-down, ~90 m/s (320 km/h) head-down. This calculator assumes no air resistance (vacuum free fall)." },
    { question: "How does gravity differ on other planets?", answer: "Gravitational acceleration varies by body: Moon 1.62, Mars 3.71, Earth 9.81, Jupiter 24.79 m/s². A 50m free fall takes 3.19s on Earth but 7.86s on the Moon and 2.01s on Jupiter. Use the planet selector to explore these differences." },
    { question: "What is g-force during free fall?", answer: "During free fall, an object experiences 0g (weightlessness) — you accelerate at the same rate as gravity, so there is no contact force. This is how astronauts experience weightlessness in orbit — they are in continuous free fall around Earth. The ISS orbits at ~7.7 km/s, falling around Earth's curvature." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Physics", href: "/calculator#physics" }, { label: "Free Fall Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Free Fall Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Solve For</label>
              <div className="flex gap-2">
                {(["time", "height", "velocity"] as const).map((s) => (
                  <button key={s} onClick={() => setSolveFor(s)} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${solveFor === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Planet / Body</label>
              <select value={planet} onChange={(e) => { setPlanet(e.target.value); calculate(solveFor, height, time, velocity, e.target.value); }} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                {Object.entries(PLANETS).map(([name, g]) => (
                  <option key={name} value={name}>{name} (g = {g} m/s²)</option>
                ))}
              </select>
            </div>
            {solveFor !== "height" && solveFor !== "velocity" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Drop Height</label>
                <div className="relative">
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="50" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m</span>
                </div>
              </div>
            )}
            {solveFor === "height" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Fall Time</label>
                <div className="relative">
                  <input type="number" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="3.19" min="0" step="0.01" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">s</span>
                </div>
              </div>
            )}
            {solveFor === "velocity" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Impact Velocity</label>
                <div className="relative">
                  <input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="31.3" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate(solveFor, height, time, velocity, planet)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Free Fall on {result.pl}</div>
                <div className="text-4xl font-bold text-primary">
                  {solveFor === "time" && <>{fmt(result.T)} <span className="text-xl">seconds</span></>}
                  {solveFor === "height" && <>{fmt(result.H)} <span className="text-xl">meters</span></>}
                  {solveFor === "velocity" && <>{fmt(result.T)} <span className="text-xl">seconds</span></>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {fmt(result.H)} m drop • {fmt(result.T)} s fall time • {fmt(result.V)} m/s impact
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Detailed Results</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Drop Height", value: `${fmt(result.H)} m` },
                    { label: "Fall Time", value: `${fmt(result.T)} s` },
                    { label: "Impact Velocity", value: `${fmt(result.V)} m/s (${fmt(result.V * 3.6)} km/h)` },
                    { label: "Gravity", value: `${fmt(result.g)} m/s² (${result.pl})` },
                    { label: "Average Velocity", value: `${fmt(result.V / 2)} m/s` },
                    { label: "Impact KE (per kg)", value: `${fmt(0.5 * result.V * result.V)} J/kg` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Height & Velocity vs Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="t" tickFormatter={(v) => `${v}s`} tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="h" orientation="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="v" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line yAxisId="h" type="monotone" dataKey="h" stroke="#3b82f6" strokeWidth={2} dot={false} name="Height (m)" />
                    <Line yAxisId="v" type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} name="Velocity (m/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Planet", value: result.pl },
                    { label: "Drop Height", value: `${fmt(result.H)} m` },
                    { label: "Fall Time", value: `${fmt(result.T)} s` },
                    { label: "Impact Speed", value: `${fmt(result.V * 3.6)} km/h`, border: true, bold: true },
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
            <h2>What Is a Free Fall Calculator?</h2>
            <p>A free fall calculator computes the time, velocity, or height of an object falling under gravity with no air resistance. Pre-filled with a 50-meter drop on Earth (g = 9.81 m/s²), the fall takes approximately 3.19 seconds with an impact velocity of 31.3 m/s (113 km/h). Select different planets to see how gravity affects free fall — a 50m drop on the Moon takes 7.86 seconds.</p>
            <h2>Free Fall Equations</h2>
            <p><strong>h = ½gt²</strong> — height fallen after time t. <strong>t = √(2h/g)</strong> — time to fall height h. <strong>v = gt</strong> — velocity at time t. <strong>v = √(2gh)</strong> — impact velocity from height h. All assume starting from rest (v₀ = 0) with no air resistance.</p>
            <h2>Galileo's Discovery</h2>
            <p>Galileo Galilei demonstrated that all objects fall at the same rate regardless of mass (in the absence of air resistance). This was revolutionary — Aristotle had taught for 2,000 years that heavier objects fall faster. Galileo used inclined planes to slow motion for measurement. The famous Leaning Tower of Pisa experiment may be apocryphal, but the physics is unquestionable.</p>
            <h2>Air Resistance and Terminal Velocity</h2>
            <p>In real-world free fall, air resistance (drag) opposes motion: F_drag = ½ρv²C_d A. As velocity increases, drag increases until it equals gravitational force. At terminal velocity, net force = 0 and acceleration stops. Skydiver (belly-down): ~55 m/s. Skydiver (head-down): ~90 m/s. Baseball: ~42 m/s. Raindrop: ~9 m/s. This calculator gives vacuum free-fall values.</p>
            <h2>Planetary Free Fall</h2>
            <p>This calculator supports 8 celestial bodies. On the Moon (g = 1.62), a 50m drop takes 7.86s vs 3.19s on Earth. On Jupiter (g = 24.79), just 2.01s. These differences are critical for space mission design — landing on Mars requires less deceleration thrust than Earth but more than the Moon. Astronauts on the ISS experience continuous free fall (0g) while orbiting at 7.7 km/s.</p>
            <h2>Energy in Free Fall</h2>
            <p>As an object falls, potential energy converts to kinetic energy: mgh → ½mv². Total mechanical energy is conserved in a vacuum. Impact kinetic energy per unit mass = gh. For 50m on Earth: 490.5 J/kg. This energy must be absorbed or dissipated on impact — explaining why falls from height are so dangerous.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/free-fall-calculator" />
          <PopularCalculators exclude="/calculator/free-fall-calculator" />
        </div>
      </div>
    </>
  );
};

export default FreeFallCalculator;
