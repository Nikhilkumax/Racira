"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const sci = (n: number) => n < 0.01 || n > 99999 ? n.toExponential(3) : fmt(n);

const CircularMotionCalculator = () => {
  const DEFAULTS = { mass: "5", radius: "2", velocity: "10" };
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [radius, setRadius] = useState(DEFAULTS.radius);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [result, setResult] = useState<any>(null);

  const calculate = (m = mass, r = radius, v = velocity) => {
    const M = parseFloat(m) || 0;
    const R = parseFloat(r) || 0;
    const V = parseFloat(v) || 0;
    if (M <= 0 || R <= 0 || V <= 0) return;
    const ac = (V * V) / R;
    const Fc = M * ac;
    const omega = V / R;
    const T = (2 * Math.PI * R) / V;
    const f = 1 / T;
    const rpm = f * 60;
    const g_force = ac / 9.81;
    const chartData = [
      { name: "Centripetal Accel", value: parseFloat(ac.toFixed(1)), unit: "m/s²", color: "#3b82f6" },
      { name: "Centripetal Force", value: parseFloat(Fc.toFixed(1)), unit: "N", color: "#10b981" },
      { name: "G-Force", value: parseFloat(g_force.toFixed(2)), unit: "g", color: "#f59e0b" },
    ];
    setResult({ M, R, V, ac, Fc, omega, T, f, rpm, g_force, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setMass(DEFAULTS.mass); setRadius(DEFAULTS.radius); setVelocity(DEFAULTS.velocity); calculate(DEFAULTS.mass, DEFAULTS.radius, DEFAULTS.velocity); };

  const faqs = [
    { question: "What is circular motion?", answer: "Circular motion is the movement of an object along a circular path. Even at constant speed, the object is continuously accelerating because its direction is constantly changing. This acceleration points toward the center of the circle and is called centripetal acceleration: ac = v²/r." },
    { question: "What is centripetal force?", answer: "Centripetal force is the net inward force required to keep an object moving in a circle: Fc = mv²/r = mω²r. It is NOT a separate force — it is the net result of existing forces (gravity, tension, friction, normal force) directed toward the center. Without centripetal force, the object would fly off tangentially (Newton's First Law)." },
    { question: "What is centrifugal force?", answer: "Centrifugal force is a fictitious (pseudo) force that appears only in a rotating reference frame. In the non-inertial (rotating) frame, objects appear to be pushed outward. In the inertial (lab) frame, there is no centrifugal force — objects simply tend to continue in a straight line (inertia) and need centripetal force to curve." },
    { question: "What is angular velocity?", answer: "Angular velocity (ω) is the rate of rotation: ω = v/r = 2πf radians/second. For our defaults: ω = 10/2 = 5 rad/s. One full revolution = 2π radians = 360°. ω relates to frequency: ω = 2πf, and to period: ω = 2π/T." },
    { question: "What is the G-force in circular motion?", answer: "G-force in circular motion = centripetal acceleration / 9.81. For 10 m/s at 2m radius: ac = 50 m/s², G-force = 5.1g. Fighter pilots can withstand up to 9g for brief periods. Washing machine spin cycles generate ~300g. Centrifuges for training astronauts reach 3–8g." },
    { question: "What are real-world examples of circular motion?", answer: "Planets orbiting the Sun (gravity provides centripetal force). Cars turning (friction provides centripetal force). Satellites in orbit (gravity = centripetal force). Centrifuges (separating materials by density). Amusement park rides (normal force and gravity). Electrons orbiting atomic nuclei (electromagnetic force)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Physics", href: "/calculator#physics" }, { label: "Circular Motion Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Circular Motion Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Mass</label>
              <div className="relative">
                <input type="number" value={mass} onChange={(e) => setMass(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5" min="0" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Radius</label>
              <div className="relative">
                <input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="2" min="0.01" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Tangential Velocity</label>
              <div className="relative">
                <input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="0" step="0.1" />
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Centripetal Force</div>
                <div className="text-4xl font-bold text-primary">{sci(result.Fc)} <span className="text-xl">N</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  {fmt(result.g_force, 1)}× Earth gravity • Period: {fmt(result.T)} s
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Motion Parameters</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Mass (m)", value: `${fmt(result.M)} kg` },
                    { label: "Radius (r)", value: `${fmt(result.R)} m` },
                    { label: "Tangential Velocity (v)", value: `${fmt(result.V)} m/s (${fmt(result.V * 3.6)} km/h)` },
                    { label: "Centripetal Accel (v²/r)", value: `${sci(result.ac)} m/s²` },
                    { label: "Centripetal Force (mv²/r)", value: `${sci(result.Fc)} N` },
                    { label: "Angular Velocity (ω)", value: `${fmt(result.omega)} rad/s` },
                    { label: "Period (T)", value: `${fmt(result.T)} s` },
                    { label: "Frequency (f)", value: `${fmt(result.f, 3)} Hz` },
                    { label: "RPM", value: `${fmt(result.rpm, 1)}` },
                    { label: "G-Force", value: `${fmt(result.g_force, 1)} g` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Key Quantities</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any, name: any, props: any) => `${Number(v).toFixed(2)} ${props.payload.unit}`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Centripetal Force", value: `${sci(result.Fc)} N` },
                    { label: "Centripetal Accel", value: `${sci(result.ac)} m/s²` },
                    { label: "Angular Velocity", value: `${fmt(result.omega)} rad/s` },
                    { label: "G-Force", value: `${fmt(result.g_force, 1)} g`, border: true, bold: true },
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Circular Motion Calculator?</h2>
            <p>A circular motion calculator computes the centripetal acceleration, centripetal force, angular velocity, period, frequency, and G-force for an object moving in a circular path. Pre-filled with a 5 kg object at radius 2 m moving at 10 m/s, the centripetal acceleration is 50 m/s² (5.1g) and the centripetal force is 250 N.</p>
            <h2>Core Formulas</h2>
            <p><strong>Centripetal acceleration:</strong> ac = v²/r = ω²r. <strong>Centripetal force:</strong> Fc = mac = mv²/r. <strong>Angular velocity:</strong> ω = v/r = 2πf. <strong>Period:</strong> T = 2πr/v = 1/f. <strong>Frequency:</strong> f = v/(2πr) = ω/(2π). All assume uniform circular motion — constant speed along a circular path.</p>
            <h2>Understanding Centripetal vs Centrifugal</h2>
            <p>Centripetal ("center-seeking") force is the real, inward force that causes circular motion. It is provided by gravity (orbits), tension (ball on a string), friction (car turning), or normal force (roller coaster loop). Centrifugal ("center-fleeing") force is a fictitious force that appears only in the rotating (non-inertial) reference frame. In the lab frame, objects don't fly outward — they simply continue in a straight line unless an inward force (centripetal) curves their path.</p>
            <h2>G-Force in Circular Motion</h2>
            <p>G-force = centripetal acceleration / 9.81 m/s². Humans can tolerate 3–5g sustained (fighter pilots with g-suits). Brief exposure: 9g (F1 car crashes). Centrifuges for astronaut training: 3–8g. Roller coasters: 2–6g. Washing machine spin cycle: ~300g. Uranium enrichment centrifuges: &gt;100,000g. G-force tolerance depends on direction relative to the body — vertical (head-to-foot) is the hardest to sustain.</p>
            <h2>Circular Motion in Orbital Mechanics</h2>
            <p>For a circular orbit, the centripetal force equals gravitational force: mv²/r = GMm/r². This gives orbital velocity: v = √(GM/r). The ISS orbits at ~7.7 km/s at altitude ~400 km (r = 6,771 km from Earth's center). Geostationary orbits require r = 42,164 km with v = 3.07 km/s, where the orbital period matches Earth's rotation (23h 56m).</p>
            <h2>Banked Curves in Road Design</h2>
            <p>When a road curves, friction provides centripetal force. Banked curves supplement friction with a component of the normal force: tan(θ) = v²/(rg). For a 50 m/s car on a 200m radius curve: θ = arctan(50²/(200×9.81)) = 51.8°. Most highway curves are designed for speeds of 80–120 km/h with 5–10° banking angles. Ice and rain reduce available friction, requiring lower speeds or steeper banking.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/circular-motion-calculator" />
          <PopularCalculators exclude="/calculator/circular-motion-calculator" />
        </div>
      </div>
    </>
  );
};

export default CircularMotionCalculator;
