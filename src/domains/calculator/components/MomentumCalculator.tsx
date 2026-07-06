"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const sci = (n: number) => n < 0.01 || n > 99999 ? n.toExponential(3) : fmt(n);

const MomentumCalculator = () => {
  const DEFAULTS = { mass: "75", velocity: "10" };
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [result, setResult] = useState<any>(null);

  const calculate = (m = mass, v = velocity) => {
    const M = parseFloat(m) || 0;
    const V = parseFloat(v) || 0;
    if (M <= 0) return;
    const p = M * V;
    const ke = 0.5 * M * V * V;
    const comparisons = [
      { name: "Walking (1.5 m/s)", p: M * 1.5 },
      { name: "Running (3 m/s)", p: M * 3 },
      { name: "Cycling (8 m/s)", p: M * 8 },
      { name: "Car (30 m/s)", p: 1500 * 30 },
      { name: "You", p: Math.abs(p) },
    ];
    const chartData = comparisons.map((c) => ({ name: c.name, momentum: parseFloat(c.p.toFixed(0)) }));
    setResult({ M, V, p, ke, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setMass(DEFAULTS.mass); setVelocity(DEFAULTS.velocity); calculate(DEFAULTS.mass, DEFAULTS.velocity); };

  const faqs = [
    { question: "What is momentum?", answer: "Momentum (p) is the product of an object's mass and velocity: p = mv. It is a vector quantity — it has both magnitude and direction. Momentum is a fundamental conserved quantity in physics: the total momentum of a closed system remains constant unless acted upon by external forces." },
    { question: "What is the momentum formula?", answer: "p = m × v. Mass in kilograms, velocity in meters per second. Result is in kg⋅m/s (also equivalent to N⋅s). For a 75 kg person running at 10 m/s: p = 75 × 10 = 750 kg⋅m/s." },
    { question: "What is the law of conservation of momentum?", answer: "In a closed system with no external forces, total momentum before any interaction equals total momentum after. This applies to collisions, explosions, and any interaction. For two objects: m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'. This is one of the most fundamental conservation laws in all of physics." },
    { question: "What is impulse?", answer: "Impulse (J) is the change in momentum: J = Δp = FΔt. Force × time = change in momentum. This explains why airbags work: by increasing the time of impact, they reduce the force needed to change the same amount of momentum. Catching a ball with soft hands (longer Δt) reduces force compared to rigid hands." },
    { question: "What is the difference between momentum and kinetic energy?", answer: "Momentum (p = mv) is a vector and is always conserved in collisions. Kinetic energy (KE = ½mv²) is a scalar and is only conserved in elastic collisions. In inelastic collisions (like a car crash), momentum is conserved but kinetic energy converts to heat, sound, and deformation." },
    { question: "Can momentum be negative?", answer: "Yes — momentum is a vector. Negative momentum means the object is moving in the negative direction (opposite to the chosen positive direction). When two objects collide and bounce off each other, one may have positive and the other negative momentum, but their total sum is conserved." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Physics", href: "/calculator#physics" }, { label: "Momentum Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Momentum Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Mass</label>
              <div className="relative">
                <input type="number" value={mass} onChange={(e) => setMass(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="75" min="0" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Velocity</label>
              <div className="relative">
                <input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Linear Momentum</div>
                <div className="text-4xl font-bold text-primary">{sci(result.p)} <span className="text-xl">kg⋅m/s</span></div>
                <div className="text-sm text-muted-foreground mt-1">p = {fmt(result.M)} kg × {fmt(result.V)} m/s</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Detailed Results</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Mass (m)", value: `${fmt(result.M)} kg` },
                    { label: "Velocity (v)", value: `${fmt(result.V)} m/s (${fmt(result.V * 3.6)} km/h)` },
                    { label: "Momentum (p = mv)", value: `${sci(result.p)} kg⋅m/s` },
                    { label: "Kinetic Energy (½mv²)", value: `${sci(result.ke)} J` },
                    { label: "Impulse to Stop (J = Δp)", value: `${sci(Math.abs(result.p))} N⋅s` },
                    { label: "Force to Stop in 1s", value: `${sci(Math.abs(result.p))} N` },
                    { label: "Force to Stop in 0.1s", value: `${sci(Math.abs(result.p) * 10)} N` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Momentum Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 5, right: 15, left: 80, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={(v) => `${v}`} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} kg⋅m/s`} />
                    <Bar dataKey="momentum" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Momentum", value: `${sci(result.p)} kg⋅m/s` },
                    { label: "Kinetic Energy", value: `${sci(result.ke)} J` },
                    { label: "Speed", value: `${fmt(result.V * 3.6)} km/h` },
                    { label: "Impulse to Stop", value: `${sci(Math.abs(result.p))} N⋅s`, border: true, bold: true },
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Momentum Calculator?</h2>
            <p>A momentum calculator computes the linear momentum of an object — the product of its mass and velocity (p = mv). Momentum is one of the most fundamental quantities in physics, directly tied to Newton's Second Law and the conservation laws governing all physical interactions. Pre-filled with 75 kg at 10 m/s (a person sprinting), the momentum is 750 kg⋅m/s.</p>
            <h2 className="text-2xl font-bold mb-3">The Momentum Formula</h2>
            <p><strong>p = m × v</strong></p>
            <p>Where: p = momentum in kg⋅m/s (or N⋅s), m = mass in kilograms, v = velocity in meters per second. For 75 kg at 10 m/s: p = 750 kg⋅m/s. The momentum vector points in the direction of velocity.</p>
            <h2 className="text-2xl font-bold mb-3">Conservation of Momentum</h2>
            <p>The law of conservation of momentum states that the total momentum of a closed system remains constant. In any collision: m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'. This applies to elastic collisions (billiard balls), inelastic collisions (car crashes), and perfectly inelastic collisions (objects sticking together). It is the basis for understanding rocket propulsion, recoil, and particle physics experiments.</p>
            <h2 className="text-2xl font-bold mb-3">Impulse-Momentum Theorem</h2>
            <p>Impulse (J) equals the change in momentum: J = FΔt = Δp. This explains why: airbags reduce injury (increase Δt, decrease F). Martial artists follow through with strikes (increase Δt of force application). Catching a ball with soft hands hurts less (longer deceleration time). Crumple zones in cars absorb energy by extending the collision time.</p>
            <h2 className="text-2xl font-bold mb-3">Momentum vs Kinetic Energy</h2>
            <p>Both describe moving objects, but they differ fundamentally. Momentum (mv) is a vector — it has direction and is always conserved. Kinetic energy (½mv²) is a scalar — it has no direction and is only conserved in elastic collisions. In a perfectly inelastic collision, all kinetic energy can be lost to heat and deformation, but momentum is still perfectly conserved.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Momentum Examples</h2>
            <p>Walking person: 75 × 1.5 = 112.5 kg⋅m/s. Sprinting athlete: 75 × 10 = 750 kg⋅m/s. Car at highway speed: 1,500 × 30 = 45,000 kg⋅m/s. Bullet: 0.01 × 700 = 7 kg⋅m/s (much less than a car, but concentrated force). Freight train: 100,000 × 15 = 1,500,000 kg⋅m/s. The massive momentum of trains and ships explains why they require enormous distances to stop.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/momentum-calculator" />
          <PopularCalculators exclude="/calculator/momentum-calculator" />
        </div>
      </div>
    </>
  );
};

export default MomentumCalculator;
