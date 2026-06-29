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
const G = 6.674e-11;

const BODIES: Record<string, { mass: number; radius: number }> = {
  "Earth": { mass: 5.972e24, radius: 6.371e6 },
  "Moon": { mass: 7.342e22, radius: 1.737e6 },
  "Mars": { mass: 6.417e23, radius: 3.390e6 },
  "Jupiter": { mass: 1.898e27, radius: 6.991e7 },
  "Sun": { mass: 1.989e30, radius: 6.957e8 },
  "Venus": { mass: 4.867e24, radius: 6.052e6 },
  "Saturn": { mass: 5.683e26, radius: 5.823e7 },
};

const OrbitalVelocityCalculator = () => {
  const DEFAULTS = { body: "Earth", altitude: "400" };
  const [body, setBody] = useState(DEFAULTS.body);
  const [altitude, setAltitude] = useState(DEFAULTS.altitude);
  const [result, setResult] = useState<any>(null);

  const calculate = (b = body, alt = altitude) => {
    const A = parseFloat(alt) || 0;
    const bd = BODIES[b];
    if (!bd || A < 0) return;
    const r = bd.radius + A * 1000;
    const v = Math.sqrt(G * bd.mass / r);
    const T = (2 * Math.PI * r) / v;
    const Tmin = T / 60;
    const Thr = T / 3600;
    const vKmS = v / 1000;
    const vKmH = v * 3.6;
    const orbitsPerDay = 86400 / T;
    const geoR = Math.pow(G * bd.mass * (86400 / (2 * Math.PI)) ** 2, 1 / 3);
    const geoAlt = (geoR - bd.radius) / 1000;
    const geoV = Math.sqrt(G * bd.mass / geoR) / 1000;
    const altitudes = [200, 400, 800, 2000, 35786];
    const chartData = altitudes.map((a) => {
      const rr = bd.radius + a * 1000;
      return { name: `${a} km`, velocity: parseFloat((Math.sqrt(G * bd.mass / rr) / 1000).toFixed(2)) };
    });
    setResult({ b, A, r, v, vKmS, vKmH, T, Tmin, Thr, orbitsPerDay, geoAlt, geoV, chartData, bd });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setBody(DEFAULTS.body); setAltitude(DEFAULTS.altitude); calculate(DEFAULTS.body, DEFAULTS.altitude); };

  const faqs = [
    { question: "What is orbital velocity?", answer: "Orbital velocity is the speed an object must travel to maintain a stable circular orbit around a celestial body. It is derived by balancing gravitational force with centripetal force: v = √(GM/r), where G is the gravitational constant, M is the central body's mass, and r is the orbital radius (body radius + altitude)." },
    { question: "What is the orbital velocity formula?", answer: "v = √(GM/r). For Earth orbit at 400 km altitude: r = 6,371 + 400 = 6,771 km = 6.771 × 10⁶ m. v = √(6.674×10⁻¹¹ × 5.972×10²⁴ / 6.771×10⁶) = 7,672 m/s ≈ 7.67 km/s (27,600 km/h)." },
    { question: "What is a geostationary orbit?", answer: "A geostationary orbit has a period exactly matching Earth's rotation (23h 56m 4s), so the satellite appears stationary above a fixed point on the equator. This requires an altitude of ~35,786 km and velocity of ~3.07 km/s. Used for communications satellites, weather monitoring, and GPS." },
    { question: "Why does orbital velocity decrease with altitude?", answer: "From v = √(GM/r), as r increases, v decreases. Higher orbits have weaker gravitational pull and larger circumferences — objects orbit more slowly. Low Earth orbit (LEO, 200-2000 km): ~7.8-6.9 km/s. Geostationary (35,786 km): ~3.07 km/s. Moon's orbit (384,400 km): ~1.02 km/s." },
    { question: "What is the ISS orbital velocity?", answer: "The International Space Station orbits at ~400 km altitude with velocity ~7.67 km/s (27,600 km/h or Mach 22). It completes one orbit every ~92 minutes, circling Earth ~15.5 times per day. Astronauts experience ~16 sunrises and sunsets daily." },
    { question: "How does orbital velocity differ between planets?", answer: "Orbital velocity depends on the central body's mass: v = √(GM/r). Jupiter (318× Earth's mass) requires much higher orbital velocities at equivalent altitudes. The Moon (1.2% of Earth's mass) requires much lower velocities. Use the planet selector to compare." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Orbital Velocity Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Orbital Velocity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Central Body</label>
              <select value={body} onChange={(e) => { setBody(e.target.value); calculate(e.target.value, altitude); }} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                {Object.keys(BODIES).map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Orbital Altitude</label>
              <div className="relative">
                <input type="number" value={altitude} onChange={(e) => setAltitude(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="400" min="0" step="1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">km</span>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Orbital Velocity around {result.b}</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.vKmS, 2)} <span className="text-xl">km/s</span></div>
                <div className="text-sm text-muted-foreground mt-1">At {fmt(result.A, 0)} km altitude • Period: {fmt(result.Tmin, 1)} min</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Orbital Parameters</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Altitude", value: `${fmt(result.A, 0)} km` },
                    { label: "Orbital Radius", value: `${sci(result.r / 1000)} km` },
                    { label: "Orbital Velocity", value: `${fmt(result.vKmS, 2)} km/s` },
                    { label: "Velocity (km/h)", value: `${fmt(result.vKmH, 0)} km/h` },
                    { label: "Orbital Period", value: `${fmt(result.Tmin, 1)} min (${fmt(result.Thr, 2)} hr)` },
                    { label: "Orbits Per Day", value: fmt(result.orbitsPerDay, 1) },
                    { label: `${result.b} Geostationary Alt`, value: `${fmt(result.geoAlt, 0)} km` },
                    { label: `Geostationary Velocity`, value: `${fmt(result.geoV, 2)} km/s` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Velocity vs Altitude ({result.b})</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => `${v}`} tick={{ fontSize: 11 }} label={{ value: "km/s", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} km/s`} />
                    <Bar dataKey="velocity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is an Orbital Velocity Calculator?</h2>
            <p>An orbital velocity calculator computes the speed required for an object to maintain a stable circular orbit around a celestial body at a given altitude. Pre-filled with Earth at 400 km altitude (the ISS orbit), the orbital velocity is approximately 7.67 km/s (27,600 km/h or Mach 22). This calculator supports 7 celestial bodies from the Moon to the Sun.</p>
            <h2>The Orbital Velocity Formula</h2>
            <p><strong>v = √(GM/r)</strong> where G = 6.674 × 10⁻¹¹ N⋅m²/kg² (gravitational constant), M = mass of central body (kg), r = orbital radius = body radius + altitude (m). For Earth at 400 km: v = √(6.674e-11 × 5.972e24 / 6.771e6) = 7,672 m/s. The formula derives from equating gravitational force (GMm/r²) with centripetal force (mv²/r).</p>
            <h2>Orbital Mechanics Fundamentals</h2>
            <p>Kepler and Newton established that orbital velocity decreases with altitude: v ∝ 1/√r. Low orbits are fast but experience atmospheric drag. High orbits are slower but more stable. The sweet spot for many applications is medium Earth orbit (MEO, 2,000-35,786 km) — used by GPS satellites (20,200 km altitude, ~3.87 km/s).</p>
            <h2>Types of Earth Orbits</h2>
            <p>Low Earth Orbit (LEO, 200-2,000 km): ISS, Hubble, Starlink. Period 88-127 min. Medium Earth Orbit (MEO, 2,000-35,786 km): GPS, Galileo. Geostationary (GEO, 35,786 km): Communications, weather. Period exactly 24h. High Earth Orbit (HEO): Highly elliptical orbits for specialized missions. Each orbit type has distinct velocity, period, and application characteristics.</p>
            <h2>Escape Velocity vs Orbital Velocity</h2>
            <p>Escape velocity is exactly √2 times orbital velocity at the same altitude: v_escape = √2 × v_orbital. At Earth's surface: orbital velocity ≈ 7.9 km/s, escape velocity ≈ 11.2 km/s. To leave Earth entirely requires 41% more velocity than to orbit. This relationship holds for any celestial body.</p>
            <h2>Practical Applications</h2>
            <p>Satellite deployment: rockets must accelerate payloads to orbital velocity. Space debris tracking: knowing orbital velocities helps predict collision risks. Spacecraft rendezvous: matching orbits requires precise velocity adjustments (delta-v). Planetary missions: calculating transfer orbits between planets requires knowing orbital velocities at departure and arrival.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/orbital-velocity-calculator" />
          <PopularCalculators exclude="/calculator/orbital-velocity-calculator" />
        </div>
      </div>
    </>
  );
};

export default OrbitalVelocityCalculator;
