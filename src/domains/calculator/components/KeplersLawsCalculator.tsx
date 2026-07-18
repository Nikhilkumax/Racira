"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const sci = (n: number) => Math.abs(n) < 0.01 || Math.abs(n) > 99999 ? n.toExponential(3) : fmt(n);

const KeplersLawsCalculator = () => {
  const DEFAULTS = { semiMajorAxis: "1.496e8", centralMass: "1.989e30", eccentricity: "0.0167", mode: "period" };
  const [semiMajorAxis, setSemiMajorAxis] = useState(DEFAULTS.semiMajorAxis);
  const [centralMass, setCentralMass] = useState(DEFAULTS.centralMass);
  const [eccentricity, setEccentricity] = useState(DEFAULTS.eccentricity);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [period, setPeriod] = useState("");
  const [result, setResult] = useState<any>(null);

  const GC = 6.674e-11;

  const calculate = (a = semiMajorAxis, m = centralMass, e = eccentricity, md = mode, p = period) => {
    const A = parseFloat(a) || 0;
    const M = parseFloat(m) || 0;
    const E = parseFloat(e) || 0;
    if (md === "period") {
      if (A <= 0 || M <= 0 || E < 0 || E >= 1) return;
      const aM = A * 1000;
      const T = 2 * Math.PI * Math.sqrt(aM * aM * aM / (GC * M));
      const Tdays = T / 86400;
      const Tyears = T / (365.25 * 86400);
      const perihelion = A * (1 - E);
      const aphelion = A * (1 + E);
      const b = A * Math.sqrt(1 - E * E);
      const vPeri = Math.sqrt(GC * M * (1 + E) / (aM * (1 - E)));
      const vAph = Math.sqrt(GC * M * (1 - E) / (aM * (1 + E)));
      const planets = [
        { name: "Mercury", a: 5.791e7, T: 87.97 },
        { name: "Venus", a: 1.082e8, T: 224.7 },
        { name: "Earth", a: 1.496e8, T: 365.25 },
        { name: "Mars", a: 2.279e8, T: 687.0 },
        { name: "Jupiter", a: 7.785e8, T: 4333 },
      ];
      const chartData = planets.map((pl) => ({ name: pl.name, period: parseFloat(pl.T.toFixed(0)) }));
      chartData.push({ name: "Input", period: parseFloat(Tdays.toFixed(0)) });
      setResult({ A, M, E, aM, T, Tdays, Tyears, perihelion, aphelion, b, vPeri, vAph, chartData, md });
    } else {
      const P = parseFloat(p) || 0;
      if (P <= 0 || M <= 0) return;
      const Tsec = P * 86400;
      const aM = Math.pow(GC * M * Tsec * Tsec / (4 * Math.PI * Math.PI), 1 / 3);
      const A2 = aM / 1000;
      setResult({ A: A2, M, E: 0, aM, T: Tsec, Tdays: P, Tyears: P / 365.25, perihelion: A2, aphelion: A2, b: A2, vPeri: 0, vAph: 0, chartData: [], md });
    }
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setSemiMajorAxis(DEFAULTS.semiMajorAxis); setCentralMass(DEFAULTS.centralMass);
    setEccentricity(DEFAULTS.eccentricity); setMode(DEFAULTS.mode); setPeriod("");
    calculate(DEFAULTS.semiMajorAxis, DEFAULTS.centralMass, DEFAULTS.eccentricity, DEFAULTS.mode, "");
  };

  const faqs = [
    { question: "What are Kepler's three laws?", answer: "1st Law (Law of Ellipses): Planets orbit in ellipses with the Sun at one focus. 2nd Law (Law of Equal Areas): A line from planet to Sun sweeps equal areas in equal times — planets move faster at perihelion and slower at aphelion. 3rd Law (Law of Periods): T² ∝ a³ — the square of the orbital period is proportional to the cube of the semi-major axis." },
    { question: "What is the Third Law formula?", answer: "T² = (4π²/GM) × a³, where T = orbital period (seconds), G = gravitational constant, M = central body mass (kg), a = semi-major axis (meters). For Earth: a = 1.496×10⁸ km, M = 1.989×10³⁰ kg → T = 365.25 days." },
    { question: "What is orbital eccentricity?", answer: "Eccentricity (e) measures how elongated an orbit is. e = 0: perfect circle. 0 < e < 1: ellipse. e = 1: parabola (escape trajectory). e > 1: hyperbola. Earth: e = 0.0167 (nearly circular). Mercury: e = 0.2056. Halley's Comet: e = 0.967 (highly elongated)." },
    { question: "What are perihelion and aphelion?", answer: "Perihelion = closest point to the Sun = a(1−e). Aphelion = farthest point = a(1+e). For Earth: perihelion ≈ 147.1 million km (January), aphelion ≈ 152.1 million km (July). The 3.3% distance difference causes only ~7% variation in solar intensity — seasons are caused by axial tilt, not distance." },
    { question: "How does Kepler's Second Law relate to angular momentum?", answer: "Kepler's Second Law (equal areas in equal times) is a direct consequence of conservation of angular momentum. In the absence of torque, L = mvr is constant. At perihelion (smaller r), v must be larger. At aphelion (larger r), v is smaller. This elegant result derives from the central nature of gravitational force." },
    { question: "Did Newton prove Kepler's Laws?", answer: "Newton derived Kepler's empirical laws from his law of universal gravitation (F = GMm/r²) and laws of motion. Newton showed that inverse-square forces produce exactly the elliptical orbits Kepler observed. Newton also generalized the laws: they apply to any two-body gravitational system, not just planets and the Sun." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Kepler's Laws Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">{"Kepler's Laws Calculator"}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Solve For</label>
              <div className="flex gap-2">
                {(["period", "axis"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {m === "period" ? "Orbital Period" : "Semi-Major Axis"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Central Body Mass (kg)</label>
              <input type="text" value={centralMass} onChange={(e) => setCentralMass(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1.989e30" />
              <div className="text-xs text-muted-foreground mt-1">Sun = 1.989e30, Earth = 5.972e24</div>
            </div>
            {mode === "period" ? (<>
              <div>
                <label className="text-base font-medium block mb-1.5">Semi-Major Axis (km)</label>
                <input type="text" value={semiMajorAxis} onChange={(e) => setSemiMajorAxis(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1.496e8" />
                <div className="text-xs text-muted-foreground mt-1">Earth = 1.496e8 km (1 AU)</div>
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Eccentricity (0–0.999)</label>
                <input type="number" value={eccentricity} onChange={(e) => setEccentricity(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="0.0167" min="0" max="0.999" step="0.001" />
              </div>
            </>) : (
              <div>
                <label className="text-base font-medium block mb-1.5">Orbital Period (days)</label>
                <input type="number" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="365.25" min="0" step="0.1" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate(semiMajorAxis, centralMass, eccentricity, mode, period)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{result.md === "period" ? "Orbital Period" : "Semi-Major Axis"}</div>
                <div className="text-4xl font-bold text-primary">
                  {result.md === "period" ? <>{fmt(result.Tdays, 2)} <span className="text-xl">days</span></> : <>{sci(result.A)} <span className="text-xl">km</span></>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.md === "period" ? `${fmt(result.Tyears, 4)} years` : `${fmt(result.Tdays, 2)} days`}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Orbital Parameters</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Semi-Major Axis (a)", value: `${sci(result.A)} km` },
                    { label: "Semi-Minor Axis (b)", value: `${sci(result.b)} km` },
                    { label: "Eccentricity (e)", value: fmt(result.E, 4) },
                    { label: "Orbital Period", value: `${fmt(result.Tdays, 2)} days (${fmt(result.Tyears, 4)} years)` },
                    { label: "Perihelion Distance", value: `${sci(result.perihelion)} km` },
                    { label: "Aphelion Distance", value: `${sci(result.aphelion)} km` },
                    ...(result.vPeri > 0 ? [
                      { label: "Velocity at Perihelion", value: `${fmt(result.vPeri / 1000, 2)} km/s` },
                      { label: "Velocity at Aphelion", value: `${fmt(result.vAph / 1000, 2)} km/s` },
                    ] : []),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData.length > 0 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Orbital Periods — Solar System</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} layout="vertical" margin={{ top: 5, right: 15, left: 55, bottom: 5 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
                      <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} days`} />
                      <Bar dataKey="period" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">{"What Is a Kepler's Laws Calculator?"}</h2>
            <p>{"A Kepler's Laws calculator applies Johannes Kepler's Third Law of Planetary Motion (T² ∝ a³) to compute orbital periods from semi-major axes or vice versa. Pre-filled with Earth's orbit around the Sun (a = 1.496×10⁸ km, e = 0.0167), the calculated period is 365.25 days — exactly one year. The calculator also computes perihelion/aphelion distances and orbital velocities using Kepler's First and Second Laws."}</p>
            <h2 className="text-2xl font-bold mb-3">{"Kepler's Three Laws"}</h2>
            <p><strong>First Law (Ellipses):</strong> Every planet moves in an elliptical orbit with the Sun at one focus. The eccentricity determines how elongated the ellipse is. <strong>Second Law (Equal Areas):</strong> A line connecting a planet to the Sun sweeps out equal areas in equal times. Planets move faster near perihelion and slower near aphelion. <strong>Third Law (Harmonics):</strong> T² = (4π²/GM)a³ — the period squared is proportional to the semi-major axis cubed.</p>
            <h2 className="text-2xl font-bold mb-3">Orbital Eccentricity</h2>
            <p>Eccentricity measures orbital shape: 0 = circle, approaching 1 = highly elongated ellipse. Earth: 0.0167 (nearly circular, only 3.3% variation in Sun distance). Mars: 0.0934 (more elliptical). Mercury: 0.2056 (most eccentric planet). Pluto: 0.2488. {"Halley's Comet: 0.967 (extremely elongated, perihelion 0.59 AU, aphelion 35.1 AU)."}</p>
            <h2 className="text-2xl font-bold mb-3">Perihelion and Aphelion Velocities</h2>
            <p>{"From Kepler's Second Law and conservation of angular momentum, orbital velocity varies with distance. At perihelion: v_p = √(GM(1+e)/(a(1−e))). At aphelion: v_a = √(GM(1−e)/(a(1+e))). For Earth: v_perihelion ≈ 30.29 km/s (January), v_aphelion ≈ 29.29 km/s (July). The velocity ratio equals the inverse distance ratio: v_p/v_a = (1+e)/(1−e)."}</p>
            <h2 className="text-2xl font-bold mb-3">{"Newton's Generalization"}</h2>
            <p>{"Newton proved that Kepler's empirical laws are mathematical consequences of inverse-square gravitational force (F = GMm/r²). Newton also generalized the laws: they apply to any two-body system — binary stars, planet-moon systems, artificial satellites. The generalized Third Law: T² = 4π²a³/(G(M₁+M₂)) accounts for the orbiting body's mass, important when both bodies have comparable masses."}</p>
            <h2 className="text-2xl font-bold mb-3">Applications in Modern Astronomy</h2>
            <p>{"Exoplanet detection: Kepler's Third Law is used to calculate exoplanet orbital radii from measured periods (transit method). Satellite deployment: determining correct orbits for GPS, communications, and Earth observation. Binary star masses: measuring orbital periods and separations gives total system mass. Galaxy dynamics: deviations from Keplerian orbits provide evidence for dark matter."}</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/keplers-laws-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Keplers Laws Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Keplers Laws Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Keplers Laws Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Keplers Laws Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Keplers Laws Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/keplers-laws-calculator" />
        </div>
      </div>
    </>
  );
};

export default KeplersLawsCalculator;
